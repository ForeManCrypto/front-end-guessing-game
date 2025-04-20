import React, { useState, useEffect, useMemo } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { Typography, Button, Box, Paper, CircularProgress, TextField, Divider, Grid, Card, CardContent, Container, Tooltip, GridProps } from '@mui/material';
import { styled } from '@mui/system';
import { CONTRACT_ADDRESS, config } from '../client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';

interface GameState {
  admin: string;
  guess_count: number;
  pool: string;
  target_number: number;
  round_id: number;
  max_guesses: number;
}

interface Guess {
  player: string;
  number: number;
}

interface GuessingGamePageProps {
  client: SigningCosmWasmClient | null;
  address: string | null;
}

const NumberButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== '$guessed',
})<{ $guessed: boolean }>(({ $guessed }) => ({
  minWidth: '48px',
  height: '48px',
  margin: '4px',
  position: 'relative',
  backgroundColor: $guessed ? '#E5E7EB' : '#00A1FF',
  color: $guessed ? '#666' : '#FFFFFF', // Darker color for better contrast
  textDecoration: $guessed ? 'line-through' : 'none',
  fontFamily: 'Inter',
  '&:hover': {
    backgroundColor: $guessed ? '#D1D5DB' : '#0088CC',
    transform: 'scale(1.05)',
  },
  '&:disabled': {
    backgroundColor: '#E5E7EB',
    color: '#666',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 161, 255, 0.2)',
  },
}));

const AdminCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#F5F5F5',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}));

const GuessingGamePage: React.FC<GuessingGamePageProps> = ({ client, address }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [adminAmount, setAdminAmount] = useState<string>('');
  const [claimRoundId, setClaimRoundId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [roundActive, setRoundActive] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const GUESS_FEE = '15000000000'; // 15 SHR in nshr (15,000,000,000 nshr)

  const fetchGameState = async (client: SigningCosmWasmClient) => {
    try {
      const result: GameState = await client.queryContractSmart(CONTRACT_ADDRESS, { get_game_state: {} });
      console.log('Fetched game state:', result);
      const isActive = parseInt(result.pool) > 0;
      setRoundActive(isActive);
      setGameState(result);
      setMessage('Game state refreshed');
    } catch (error) {
      setMessage('Error fetching game state: ' + (error as Error).message);
      console.error('Fetch game state error:', error);
    }
  };

  const fetchGuesses = async (client: SigningCosmWasmClient) => {
    try {
      const rawResponse = await client.queryContractSmart(CONTRACT_ADDRESS, { get_guesses: {} });
      console.log('Raw guesses response:', rawResponse);
      let guessesArray: { player: string; number: number }[];
      if (Array.isArray(rawResponse)) {
        guessesArray = rawResponse.map((item: any) => ({
          player: item.player,
          number: item.number,
        }));
      } else {
        guessesArray = [];
        console.warn('Unexpected guesses response format:', rawResponse);
      }
      console.log('Processed guesses:', guessesArray);
      setGuesses(guessesArray);
    } catch (error) {
      setMessage('Error fetching guesses: ' + (error as Error).message);
      console.error('Fetch guesses error:', error);
    }
  };

  const handleRefresh = async () => {
    if (!client) {
      setMessage('Wallet not connected');
      return;
    }
    setLoading(true);
    try {
      await fetchGameState(client);
      await fetchGuesses(client);
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = async () => {
    if (!client || !address || selectedNumber === null) {
      setMessage('Wallet not connected or no number selected');
      return;
    }
    if (!roundActive) {
      setMessage('Round is not active. Admin must add funds to start the round.');
      return;
    }
    setIsSubmitting(true);
    try {
      const fee = {
        amount: [{ denom: config.denom, amount: GUESS_FEE }],
        gas: '200000',
      };
      const balance = await client.getBalance(address, config.denom);
      console.log('Balance:', balance);
      if (BigInt(balance.amount) < BigInt(GUESS_FEE)) {
        throw new Error(`Insufficient balance: ${balance.amount} ${config.denom} available`);
      }

      const msg = { guess: { number: selectedNumber } };
      const funds = [{ denom: config.denom, amount: GUESS_FEE }];
      console.log('Submitting guess:', { msg, funds, fee });
      const result = await client.execute(address, CONTRACT_ADDRESS, msg, fee, 'Submit guess', funds);
      setMessage(`Guess submitted! Tx: ${result.transactionHash}`);
      await fetchGameState(client);
      await fetchGuesses(client);
      setSelectedNumber(null);
    } catch (error) {
      setMessage('Error submitting guess: ' + (error as Error).message);
      console.error('Guess error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimPrize = async () => {
    if (!client || !address || !claimRoundId) {
      setMessage('Wallet not connected or no round ID specified');
      return;
    }
    const roundId = parseInt(claimRoundId);
    if (isNaN(roundId) || roundId <= 0) {
      setMessage('Enter a valid round ID');
      return;
    }
    setLoading(true);
    try {
      const fee = {
        amount: [{ denom: config.denom, amount: '10000000' }],
        gas: '200000',
      };
      const msg = { claim_prize: { round_id: roundId } };
      const result = await client.execute(address, CONTRACT_ADDRESS, msg, fee, 'Claim prize');
      setMessage(`Prize claimed! Tx: ${result.transactionHash}`);
      await fetchGameState(client);
      setClaimRoundId('');
    } catch (error) {
      setMessage('Error claiming prize: ' + (error as Error).message);
      console.error('Claim prize error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (action: 'add' | 'collect') => {
    if (!client || !address || !gameState) {
      setMessage('Wallet not connected');
      return;
    }
    if (address !== gameState.admin) {
      setMessage('Only admin can perform this action');
      return;
    }
    const amount = parseInt(adminAmount);
    if (action === 'add' && (isNaN(amount) || amount <= 0)) {
      setMessage('Enter a valid amount');
      return;
    }
    const roundId = parseInt(claimRoundId);
    if (action === 'collect' && (isNaN(roundId) || roundId <= 0)) {
      setMessage('Enter a valid round ID');
      return;
    }

    setLoading(true);
    try {
      const fee = {
        amount: [{ denom: config.denom, amount: '10000000' }],
        gas: '200000',
      };
      let msg;
      let funds: { denom: string; amount: string }[] = [];
      if (action === 'add') {
        msg = { add_funds_to_pool: {} };
        funds = [{ denom: config.denom, amount: amount.toString() }];
      } else {
        msg = { collect_unclaimed_pool: { round_id: roundId } };
      }

      console.log('Admin action:', { action, msg, funds, fee });
      const result = await client.execute(address, CONTRACT_ADDRESS, msg, fee, `${action} funds`, funds);
      setMessage(`${action} successful! Tx: ${result.transactionHash}`);
      await fetchGameState(client);
      await fetchGuesses(client);
      setAdminAmount('');
      setClaimRoundId('');
    } catch (error) {
      setMessage(`Error performing ${action}: ` + (error as Error).message);
      console.error('Admin action error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    const num = parseInt(amount);
    return isNaN(num) ? '0.00' : (num / 1e9).toFixed(2); // Convert nshr to SHR (9 decimals)
  };

  const numberGrid = useMemo(() => {
    const maxNumbers = gameState?.max_guesses || 200;
    const basis = maxNumbers <= 10 ? '10%' : '5%'; // Adjust button size based on max_guesses
    return Array.from({ length: Math.min(maxNumbers, 200) }, (_, i) => i + 1).map((num) => {
      const isGuessed = guesses.some((g) => g.number === num);
      return (
        <Box key={num} sx={{ flexBasis: basis, padding: '2px' }}>
          <Tooltip title={isGuessed ? 'Already Guessed' : `Guess ${num}`} placement="top">
            <span>
              <NumberButton
                $guessed={isGuessed}
                disabled={isGuessed || !roundActive || isSubmitting}
                onClick={() => setSelectedNumber(num)}
                variant={selectedNumber === num ? 'contained' : 'outlined'}
                aria-label={`Guess number ${num}`}
              >
                {num}
              </NumberButton>
            </span>
          </Tooltip>
        </Box>
      );
    });
  }, [guesses, roundActive, isSubmitting, selectedNumber, gameState]);

  useEffect(() => {
    if (client) {
      console.log('Starting state refresh interval');
      const interval = setInterval(async () => {
        console.log('Refreshing state...');
        try {
          await fetchGameState(client);
          await fetchGuesses(client);
        } catch (error) {
          console.error('Refresh error:', error);
          setMessage('Error refreshing state: ' + (error as Error).message);
        }
      }, 5000);
      return () => {
        console.log('Clearing state refresh interval');
        clearInterval(interval);
      };
    }
  }, [client]);

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#FFFFFF' }}>
      {address ? (
        <Grid container spacing={3}>
          {/* Goal Panel (Top Left) */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ color: '#0A0F26', fontFamily: 'Inter', fontWeight: 'bold', mb: 2 }}>
                  Identity Guessing Game
                </Typography>
                <Typography sx={{ color: '#0A0F26', fontFamily: 'Inter', lineHeight: 1.6 }}>
                  Guess the target number to win SHR tokens! Test your luck and join the fun in this exciting ShareRing community game.
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
  
          {/* Info Panel (Top Right) */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: '#0A0F26', fontFamily: 'Inter', fontWeight: 'bold', mb: 2 }}>
                  Game Information
                </Typography>
                {gameState ? (
                  <Box>
                    <Typography variant="body1" sx={{ color: '#0A0F26', fontFamily: 'Inter', mb: 1 }}>
                      Connected Address: {address.slice(0, 10)}...{address.slice(-4)}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#0A0F26', fontFamily: 'Inter', mb: 1 }}>
                      Round ID: {gameState.round_id}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#0A0F26', fontFamily: 'Inter', mb: 1 }}>
                      Round Active: {roundActive ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#0A0F26', fontFamily: 'Inter', mb: 1 }}>
                      Guess Count: {gameState.guess_count} / {gameState.max_guesses}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#0A0F26', fontFamily: 'Inter', mb: 2 }}>
                      Pool: {formatAmount(gameState.pool)} SHR
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: '#00A1FF',
                        color: '#FFFFFF',
                        fontFamily: 'Inter',
                        '&:hover': { backgroundColor: '#0088CC' },
                      }}
                      onClick={handleRefresh}
                      disabled={loading}
                      aria-label="Refresh game state"
                    >
                      Refresh State
                    </Button>
                  </Box>
                ) : (
                  <Typography sx={{ color: '#0A0F26', fontFamily: 'Inter' }}>
                    Loading game information...
                  </Typography>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
  
          {/* Number Panel (Bottom, Large) */}
          <Grid item xs={12}>
            <StyledCard sx={{ minHeight: { xs: '300px', md: gameState?.max_guesses && gameState.max_guesses <= 10 ? '250px' : '400px' } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ color: '#0A0F26', fontFamily: 'Inter', fontWeight: 'bold', mb: 3 }}>
                  Select a Number (1–{gameState?.max_guesses || 200})
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: gameState?.max_guesses && gameState.max_guesses <= 10 ? 'center' : 'flex-start',
                    gap: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    mb: 3,
                    '& .MuiButton-root': {
                      minWidth: { xs: '44px', sm: '48px' },
                      height: { xs: '44px', sm: '48px' },
                      margin: { xs: '2px', sm: '4px' },
                    },
                  }}
                >
                  {numberGrid}
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#00A1FF',
                      color: '#FFFFFF',
                      fontFamily: 'Inter',
                      '&:hover': { backgroundColor: '#0088CC' },
                    }}
                    onClick={handleGuess}
                    disabled={selectedNumber === null || isSubmitting || !roundActive}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                    aria-label="Submit guess"
                  >
                    {isSubmitting ? 'Submitting...' : `Guess ${selectedNumber || ''} (15 SHR)`}
                  </Button>
                  <TextField
                    type="number"
                    label="Round ID"
                    value={claimRoundId}
                    onChange={(e) => setClaimRoundId(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ width: '150px' }}
                    aria-label="Round ID for claiming prize"
                  />
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#00A1FF',
                      color: '#FFFFFF',
                      fontFamily: 'Inter',
                      '&:hover': { backgroundColor: '#0088CC' },
                    }}
                    onClick={handleClaimPrize}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                    aria-label="Claim prize"
                  >
                    Claim Prize
                  </Button>
                </Box>
                <Typography
                  sx={{
                    color: message.includes('Error') ? '#D32F2F' : '#2E7D32',
                    fontFamily: 'Inter',
                    fontWeight: 'medium',
                    textAlign: 'center',
                  }}
                  aria-live="polite"
                >
                  {message}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
  
          {/* Admin Panel (Bottom, Small) */}
          {gameState && address === gameState.admin && (
            <Grid item xs={12} component="div">
              <AdminCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ color: '#0A0F26', fontFamily: 'Inter', fontWeight: 'bold', mb: 2 }}>
                    Admin Controls
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      '@media (max-width: 600px)': {
                        flexDirection: 'column',
                        alignItems: 'stretch',
                      },
                    }}
                  >
                    <TextField
                      type="number"
                      label="Amount (nshr)"
                      value={adminAmount}
                      onChange={(e) => setAdminAmount(e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{
                        width: { xs: '100%', sm: '200px' },
                        mb: { xs: 2, sm: 0 },
                      }}
                      aria-label="Amount in nshr for pool funds"
                    />
                    <TextField
                      type="number"
                      label="Round ID (for collect)"
                      value={claimRoundId}
                      onChange={(e) => setClaimRoundId(e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{
                        width: { xs: '100%', sm: '200px' },
                        mb: { xs: 2, sm: 0 },
                      }}
                      aria-label="Round ID for collecting unclaimed pool"
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: '#00A1FF',
                          color: '#FFFFFF',
                          fontFamily: 'Inter',
                          '&:hover': { backgroundColor: '#0088CC' },
                        }}
                        onClick={() => handleAdminAction('add')}
                        disabled={loading}
                        aria-label="Add pool funds"
                      >
                        Add Pool Funds
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: '#00A1FF',
                          color: '#FFFFFF',
                          fontFamily: 'Inter',
                          '&:hover': { backgroundColor: '#0088CC' },
                        }}
                        onClick={() => handleAdminAction('collect')}
                        disabled={loading}
                        aria-label="Collect unclaimed pool"
                      >
                        Collect Unclaimed Pool
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </AdminCard>
            </Grid>
          )}
        </Grid>
      ) : (
        <Typography sx={{ color: '#0A0F26', fontFamily: 'Inter', textAlign: 'center', mt: 4 }}>
          Please connect your wallet to play the game.
        </Typography>
      )}
    </Container>
  );
};

export default GuessingGamePage;