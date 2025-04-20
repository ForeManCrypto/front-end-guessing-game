import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import logo from '../assets/logo.png';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';

const WalletButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  backgroundColor: '#00A1FF',
  color: '#FFFFFF',
  padding: '8px 16px',
  textTransform: 'none',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#0088CC',
  },
}));

interface HeaderProps {
  address: string | null;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const Header: React.FC<HeaderProps> = ({ address, loading, onConnect, onDisconnect }) => {
  const [anchorElGames, setAnchorElGames] = useState<null | HTMLElement>(null);
  const [anchorElMore, setAnchorElMore] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, menu: 'games' | 'more') => {
    if (menu === 'games') {
      setAnchorElGames(event.currentTarget);
    } else {
      setAnchorElMore(event.currentTarget);
    }
  };

  const handleMenuClose = (menu: 'games' | 'more') => {
    if (menu === 'games') {
      setAnchorElGames(null);
    } else {
      setAnchorElMore(null);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        <ListItemButton onClick={() => setMobileOpen(false)} component={Link} to="/">
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton onClick={() => setMobileOpen(false)} component={Link} to="/game1">
          <ListItemText primary="Games: Identity Guessing Game" />
        </ListItemButton>
        <ListItemButton disabled onClick={() => setMobileOpen(false)}>
          <ListItemText primary="Games: Find the Hacker (Coming Soon)" />
        </ListItemButton>
        <ListItemButton disabled onClick={() => setMobileOpen(false)}>
          <ListItemText primary="Games: Lottery (Coming Soon)" />
        </ListItemButton>
        <ListItemButton onClick={() => setMobileOpen(false)} component={Link} to="/">
          <ListItemText primary="Community" />
        </ListItemButton>
        <ListItemButton onClick={() => setMobileOpen(false)} component={Link} to="/">
          <ListItemText primary="Learn" />
        </ListItemButton>
        <ListItemButton onClick={() => setMobileOpen(false)} component={Link} to="/">
          <ListItemText primary="More: Leaderboard" />
        </ListItemButton>
        <ListItemButton onClick={() => setMobileOpen(false)} component={Link} to="/">
          <ListItemText primary="More: Settings" />
        </ListItemButton>
        <ListItemButton onClick={() => setMobileOpen(false)} component={Link} to="/">
          <ListItemText primary="More: About" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#0A0F26' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src={logo} alt="ShareRing Logo" style={{ height: '32px', marginRight: '8px' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'Inter' }}>
              ShareRing The Identity Chain
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button color="inherit" sx={{ color: '#FFFFFF', fontFamily: 'Inter' }} component={Link} to="/">
              Home
            </Button>
            <Button
              color="inherit"
              onClick={(e) => handleMenuOpen(e, 'games')}
              endIcon={<ArrowDropDownIcon sx={{ color: '#FFFFFF' }} />}
              sx={{ color: '#FFFFFF', fontFamily: 'Inter' }}
            >
              Games
            </Button>
            <Menu
              anchorEl={anchorElGames}
              open={Boolean(anchorElGames)}
              onClose={() => handleMenuClose('games')}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => handleMenuClose('games')} component={Link} to="/game1">
                Identity Guessing Game
              </MenuItem>
              <MenuItem onClick={() => handleMenuClose('games')} disabled>
                Find the Hacker (Coming Soon)
              </MenuItem>
              <MenuItem onClick={() => handleMenuClose('games')} disabled>
                Lottery (Coming Soon)
              </MenuItem>
            </Menu>
            <Button color="inherit" sx={{ color: '#FFFFFF', fontFamily: 'Inter' }} component={Link} to="/">
              Community
            </Button>
            <Button color="inherit" sx={{ color: '#FFFFFF', fontFamily: 'Inter' }} component={Link} to="/">
              Learn
            </Button>
            <Button
              color="inherit"
              onClick={(e) => handleMenuOpen(e, 'more')}
              endIcon={<ArrowDropDownIcon sx={{ color: '#FFFFFF' }} />}
              sx={{ color: '#FFFFFF', fontFamily: 'Inter' }}
            >
              More
            </Button>
            <Menu
              anchorEl={anchorElMore}
              open={Boolean(anchorElMore)}
              onClose={() => handleMenuClose('more')}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => handleMenuClose('more')}>Leaderboard</MenuItem>
              <MenuItem onClick={() => handleMenuClose('more')}>Settings</MenuItem>
              <MenuItem onClick={() => handleMenuClose('more')}>About</MenuItem>
            </Menu>
          </Box>
          <WalletButton
            onClick={address ? onDisconnect : onConnect}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Connecting...' : address ? 'Disconnect Wallet' : 'Connect Wallet'}
          </WalletButton>
          <IconButton
            color="inherit"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ display: { xs: 'flex', md: 'none' }, ml: 1, color: '#FFFFFF' }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;