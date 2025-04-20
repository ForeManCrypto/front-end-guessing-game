import React from 'react';
import { Typography, Button, Box, Card, CardContent, CardActions } from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';

const GameCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E7EB',
  '&:hover': {
    borderColor: '#00A1FF',
    boxShadow: '0 4px 8px rgba(0, 161, 255, 0.2)',
  },
}));

const HomePage: React.FC = () => {
  return (
    <Box sx={{ py: 4, backgroundColor: '#FFFFFF' }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#0A0F26', fontFamily: 'Inter', mb: 2 }}>
          Welcome to the ShareRing Community
        </Typography>
        <Typography variant="body1" sx={{ color: '#0A0F26', fontFamily: 'Inter', mb: 4 }}>
          Play games, connect with others, and learn about ShareRing’s digital identity solutions.
        </Typography>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#00A1FF', color: '#FFFFFF', fontFamily: 'Inter', '&:hover': { backgroundColor: '#0088CC' } }}
        >
          Join Now
        </Button>
      </Box>

      {/* Games Section */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0A0F26', fontFamily: 'Inter', mb: 4 }}>
        Games
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 6 }}>
        <GameCard>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0A0F26', fontFamily: 'Inter' }}>
              Identity Guessing Game
            </Typography>
            <Typography variant="body2" sx={{ color: '#0A0F26', fontFamily: 'Inter' }}>
              Guess the target number to win SHR tokens! Test your luck and join the fun.
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              sx={{ color: '#00A1FF', fontFamily: 'Inter', '&:hover': { color: '#0088CC' } }}
              component={Link}
              to="/game1"
            >
              Play Now
            </Button>
          </CardActions>
        </GameCard>
        <GameCard>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0A0F26', fontFamily: 'Inter' }}>
              Coming Soon
            </Typography>
            <Typography variant="body2" sx={{ color: '#0A0F26', fontFamily: 'Inter' }}>
              More exciting games are on the way. Stay tuned!
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              sx={{ color: '#00A1FF', fontFamily: 'Inter', '&:hover': { color: '#0088CC' } }}
            >
              Learn More
            </Button>
          </CardActions>
        </GameCard>
      </Box>

      {/* Information Section */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0A0F26', fontFamily: 'Inter', mb: 4 }}>
        Learn About ShareRing
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 6 }}>
        <GameCard>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0A0F26', fontFamily: 'Inter' }}>
              Digital Identities
            </Typography>
            <Typography variant="body2" sx={{ color: '#0A0F26', fontFamily: 'Inter' }}>
              Discover how ShareRing’s blockchain technology secures and simplifies digital identities.
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              sx={{ color: '#00A1FF', fontFamily: 'Inter', '&:hover': { color: '#0088CC' } }}
            >
              Read More
            </Button>
          </CardActions>
        </GameCard>
        <GameCard>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0A0F26', fontFamily: 'Inter' }}>
              ShareRing Network
            </Typography>
            <Typography variant="body2" sx={{ color: '#0A0F26', fontFamily: 'Inter' }}>
              Learn about the decentralized network powering secure and frictionless access.
            </Typography>
          </CardContent>
          <CardActions>
            <a
              href="https://sharering.network/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button
                size="small"
                sx={{ color: '#00A1FF', fontFamily: 'Inter', '&:hover': { color: '#0088CC' } }}
              >
                Explore
              </Button>
            </a>
          </CardActions>
        </GameCard>
      </Box>
    </Box>
  );
};

export default HomePage;