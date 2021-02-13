import React from 'react'
import { AppBar, Toolbar, Typography, Button, Grid, Hidden, IconButton, Menu, MenuItem } from '@material-ui/core'
import HomeIcon from '@material-ui/icons/Home';
import LockIcon from '@material-ui/icons/Lock';
import MenuIcon from '@material-ui/icons/Menu';

export default function Navbar () {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position='static' style={{ height: '9vh' }}>
        <Toolbar className='navbar' style={{ backgroundColor: '#39bcb6', height: '9vh' }}>
          <Grid container >
            <Grid container item xs={9} sm={6} justify='flex-start' alignItems='center'>
              <Hidden xsDown>
                <img src='/calc-2.svg' alt='logo' style={{ maxHeight: '35px', marginRight: '15px' }} />
                <Typography className='navbar-title' variant='h5'>Saving Goal Calculator</Typography>
              </Hidden>
              <Hidden smUp>
                <img src='/calc-2.svg' alt='logo' style={{ maxHeight: '30px', marginRight: '10px' }} />
                <Typography className='navbar-title' variant='h6'>Saving Goal Calculator</Typography>
              </Hidden>
            </Grid>
            <Grid container item xs={3} sm={6} justify='flex-end' alignItems='center'>
              <Hidden xsDown>
                <Button
                  className='navbar-btn'
                  startIcon={<HomeIcon style={{ color: 'white' }} />}
                  style={{ color: 'white' }}
                >
                  Home
                </Button>
                <Button
                  className='navbar-btn'
                  startIcon={<LockIcon style={{ color: 'white' }} />}
                  style={{ color: 'white' }}
                >
                  Login
                </Button>
              </Hidden>
              <Hidden smUp>
                <IconButton
                  aria-label="more"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  onClick={handleClick}
                  style={{ color: 'white' }}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="long-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem>
                    <Button
                      className='navbar-btn'
                      startIcon={<HomeIcon style={{ color: 'white' }} />}
                      style={{ color: 'white' }}
                    >
                      Home
                    </Button>
                  </MenuItem>
                  <MenuItem>
                    <Button
                      className='navbar-btn'
                      startIcon={<LockIcon style={{ color: 'white' }} />}
                      style={{ color: 'white' }}
                    >
                      Login
                    </Button>
                  </MenuItem>
                </Menu>
              </Hidden>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </>
  )
}