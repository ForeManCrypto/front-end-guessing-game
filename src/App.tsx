import React, { useState, useEffect } from 'react';
import { connectWallet, CONTRACT_ADDRESS } from './client';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import {
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
} from '@mui/material';

interface GameState {
  pool: string;
  target_number: number;
  round_id: number;
  round_end: number;
  round_duration: number;
  admin: string;
}

interface Guess {
  number: number;
  player: string;
  round_id: number;
}

interface LeaderboardEntry {
  address: string;
  guesses: number;
  wins: number;
}

const GUESS_FEE = '100000000000'; // 100 SHR in nshr

const App: React.FC = () => {
  const [client, setClient] = useState<SigningCosmWasmClient | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentBlock, setCurrentBlock] = useState<number>(0);
  const [guessNumber, setGuessNumber] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [pastGuesses, setPastGuesses] = useState<Guess[]>([]);

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      const { client, address } = await connectWallet();
      setClient(client);
      setAddress(address);
      setMessage('Wallet connected successfully!');
      await fetchGameState(client);
      await fetchGuesses(client);
      const height = await client.getHeight();
      setCurrentBlock(height);
    } catch (error) {
      setMessage('Error connecting to wallet: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGameState = async (client: SigningCosmWasmClient) => {
    try {
      const result: GameState = await client.queryContractSmart(CONTRACT_ADDRESS, { get_game_state: {} });
      setGameState(result);
    } catch (error) {
      setMessage('Error fetching game state: ' + (error as Error).message);
    }
  };

  const fetchGuesses = async (client: SigningCosmWasmClient) => {
    try {
      const allGuesses: Guess[] = await client.queryContractSmart(CONTRACT_ADDRESS, { get_all_guesses: {} });
      
      if (address) {
        const userGuesses = allGuesses.filter(g => g.player === address);
        setPastGuesses(userGuesses);
      }

      const guessCount: { [key: string]: number } = {};
      const winCount: { [key: string]: number } = {};
      allGuesses.forEach(g => {
        guessCount[g.player] = (guessCount[g.player] || 0) + 1;
      });

      const state = gameState || (await client.queryContractSmart(CONTRACT_ADDRESS, { get_game_state: {} }));
      for (let round = 1; round < state.round_id; round++) {
        try {
          const winners: string[] = await client.queryContractSmart(CONTRACT_ADDRESS, { get_winner: { round_id: round } });
          winners.forEach(w => {
            winCount[w] = (winCount[w] || 0) + 1;
          });
        } catch (e) {
          console.warn(`No winners for round ${round}`);
        }
      }

      const leaderboardData = Object.keys(guessCount).map(addr => ({
        address: addr,
        guesses: guessCount[addr],
        wins: winCount[addr] || 0,
      })).sort((a, b) => b.wins - a.wins || b.guesses - a.guesses);
      setLeaderboard(leaderboardData.slice(0, 10));
    } catch (error) {
      console.warn('Error fetching guesses:', error);
    }
  };

  const handleGuess = async () => {
    if (!client || !address) {
      setMessage('Wallet not connected');
      return;
    }
    const guess = parseInt(guessNumber);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      setMessage('Guess must be between 1 and 100');
      return;
    }

    setLoading(true);
    try {
      const fee = {
        amount: [{ denom: 'nshr', amount: GUESS_FEE }],
        gas: '200000',
      };
      const balance = await client.getBalance(address, 'nshr');
      if (BigInt(balance.amount) < BigInt(GUESS_FEE)) {
        throw new Error(`Insufficient balance: ${balance.amount} nshr available, ${GUESS_FEE} nshr required`);
      }

      const msg = { guess: { number: guess } };
      const funds = [{ denom: 'nshr', amount: GUESS_FEE }];
      const result = await client.execute(address, CONTRACT_ADDRESS, msg, fee, 'Guessing game entry', funds);
      setMessage(`Guess submitted! Tx: ${result.transactionHash}`);
      await fetchGameState(client);
      await fetchGuesses(client);
      setGuessNumber('');
    } catch (error) {
      setMessage('Error submitting guess: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPrize = async (roundId: number) => {
    if (!client || !address) {
      setMessage('Wallet not connected');
      return;
    }

    setLoading(true);
    try {
      const fee = {
        amount: [{ denom: 'nshr', amount: '10000000' }],
        gas: '200000',
      };
      const msg = { claim_prize: { round_id: roundId } };
      const result = await client.execute(address, CONTRACT_ADDRESS, msg, fee, 'Claim prize');
      setMessage(`Prize claimed! Tx: ${result.transactionHash}`);
      await fetchGameState(client);
      await fetchGuesses(client);
    } catch (error) {
      setMessage('Error claiming prize: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client) {
      const interval = setInterval(async () => {
        const height = await client.getHeight();
        setCurrentBlock(height);
        if (gameState && height >= gameState.round_end) {
          await fetchGameState(client);
          await fetchGuesses(client);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [client, gameState]);

  const shrPool = gameState ? (parseInt(gameState.pool) / 1e9).toFixed(2) : '0';
  const isRoundEnded = gameState !== null && currentBlock >= gameState.round_end;
  const isDisabled = loading || isRoundEnded;
  console.log('Input disabled:', isDisabled);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Shareledger Guessing Game
      </Typography>

      {!address ? (
        <Box textAlign="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleConnectWallet}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
          <Typography color="error" mt={2}>{message}</Typography>
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            Connected Address: {address.slice(0, 10)}...{address.slice(-4)}
          </Typography>

          {gameState && (
            <Box mb={3}>
              <Typography>Round ID: {gameState.round_id}</Typography>
              <Typography>Pool: {shrPool} SHR ({gameState.pool} nshr)</Typography>
              <Typography>Blocks Remaining: {gameState.round_end - currentBlock}</Typography>
              <Typography>
                Round Ends at Block: {gameState.round_end} (Current: {currentBlock})
                {isRoundEnded && ' - Ended'}
              </Typography>
            </Box>
          )}

          <Box display="flex" gap={2} mb={3} onClick={() => console.log('Box clicked')}>
            <TextField
              type="number"
              label="Guess (1-100)"
              value={guessNumber}
              onChange={(e) => {
                const value = e.target.value;
                console.log('Input changed to:', value);
                setGuessNumber(value);
              }}
              onClick={(e) => {
                e.stopPropagation();
                console.log('TextField clicked');
              }}
              inputProps={{ min: 1, max: 100 }}
              variant="outlined"
              size="small"
              fullWidth
              autoFocus
              sx={{ pointerEvents: 'auto', zIndex: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleGuess}
              disabled={isDisabled}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Submitting...' : 'Submit Guess'}
            </Button>
          </Box>

          <Typography color="textSecondary" mb={2}>{message}</Typography>

          {pastGuesses.length > 0 && (
            <Box mb={3}>
              <Typography variant="h6">Your Past Guesses</Typography>
              {pastGuesses.map((g, idx) => (
                <Typography key={idx}>
                  Round {g.round_id}: {g.number}
                  {g.round_id < (gameState?.round_id || 0) && (
                    <Button
                      size="small"
                      onClick={() => handleClaimPrize(g.round_id)}
                      sx={{ ml: 1 }}
                    >
                      Claim Prize
                    </Button>
                  )}
                </Typography>
              ))}
            </Box>
          )}

          {leaderboard.length > 0 && (
            <Box>
              <Typography variant="h6">Leaderboard</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell align="right">Guesses</TableCell>
                    <TableCell align="right">Wins</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.address.slice(0, 6)}...{entry.address.slice(-4)}</TableCell>
                      <TableCell align="right">{entry.guesses}</TableCell>
                      <TableCell align="right">{entry.wins}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default App;