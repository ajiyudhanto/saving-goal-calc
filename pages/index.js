import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Grid, Typography, TextField, Button, ButtonGroup, InputAdornment, RadioGroup, Radio, FormControl, FormControlLabel } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

export default function Home() {
  const [simulation, setSimulation] = useState({
    setoranAwal: '1000',
    setoranRutin: '100',
    periodeSetoranRutin: 'bulanan',
    periodeInvestasi: '3',
    sukuBunga: '10',
    frekuensiBunga: 'tahunan'
  })

  const [proyeksiSaldo, setProyeksiSaldo] = useState(0)

  useEffect(() => {
    total()
  }, [simulation.setoranAwal, simulation.setoranRutin, simulation.periodeSetoranRutin, simulation.periodeInvestasi, simulation.sukuBunga, simulation.frekuensiBunga])

  function onChangeHandler (event) {
    let newSimulation = {...simulation}
    if (event.target.name === 'setoranAwal' || event.target.name === 'setoranRutin' || event.target.name === 'periodeInvestasi' || event.target.name === 'sukuBunga') {
      if (!Number(event.target.value)) {
        
      } else {
        newSimulation[event.target.name] = event.target.value
      }
    } else {
      newSimulation[event.target.name] = event.target.value
    }
    setSimulation(newSimulation)
  }

  function daysCount () {
    let days = 0
    if (simulation.frekuensiBunga === 'tahunan') {
      days = 365
    } else if (simulation.frekuensiBunga === 'bulanan') {
      days = 30
    } else if (simulation.frekuensiBunga === 'harian') {
      days = 1
    }
    return days
  }

  function p () {
    return 12 / daysCount()
  }

  function a () {
    //1+r/n
    
    return 1 + ((Number(simulation.sukuBunga) / 100) / daysCount())
  }

  function b () {
    //nt
    return daysCount() * Number(simulation.periodeInvestasi)
  }

  function c () {
    //compound
    return Number(simulation.setoranAwal) * (Math.pow(a(), b()))
  }

  function d () {
    //future
    return (Math.pow(a(), b()) - 1) / ((Number(simulation.sukuBunga) / 100) / daysCount())
  }

  function e () {
    //future value series
    return d() * Number(simulation.setoranRutin) * p()
  }

  function total () {
    setProyeksiSaldo(e() + c())
  }

  return (
    <div className='root'>
      <Head>
        <title>Saving Goal Calculator</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Head>

      <Grid container justify='center'>
        <Grid xs={10} item container justify='center' >
          <Typography variant='h5' style={{ fontWeight: 'bold', color: '#272727', marginTop: '50px', marginBottom: '50px' }}>Simulasi Bunga Berbunga</Typography>
        </Grid>
        <Grid xs={10} item container justify='center'>

          <Grid xs={12} item container justify='flex-start'>
            <Grid xs={12} item container justify='flex-start'>
              <Typography style={{ fontWeight: 'bold' }}>Setoran Awal (Rupiah)</Typography>
            </Grid>
            <Grid xs={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="reduce"
                >
                  <RemoveIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid xs={8} item container justify='flex-start'>
              <TextField
                value={simulation.setoranAwal}
                // InputProps={{
                //   startAdornment: <InputAdornment position="start">Rp.</InputAdornment>,
                // }}
                inputProps={{
                  style: {
                    textAlign: 'center'
                  }
                }}
                name='setoranAwal'
                variant='outlined'
                size='small'
                onChange={(event) => onChangeHandler(event)}
              />
            </Grid>
            <Grid xs={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="increase"
                >
                  <AddIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>

          <Grid xs={12} item container justify='flex-start'>
            <Grid xs={12} item container justify='flex-start'>
              <Typography style={{ fontWeight: 'bold' }}>Setoran Rutin (Rupiah)</Typography>
            </Grid>
            <Grid xs={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="reduce"
                >
                  <RemoveIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid xs={8} item container justify='flex-start'>
              <TextField
                value={simulation.setoranRutin}
                // InputProps={{
                //   startAdornment: <InputAdornment position="start">Rp.</InputAdornment>,
                // }}
                inputProps={{
                  style: {
                    textAlign: 'center'
                  }
                }}
                variant='outlined'
                size='small'
              />
            </Grid>
            <Grid xs={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="increase"
                >
                  <AddIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid xs={12} item container>
              <FormControl>
                <RadioGroup row name="gender" value={simulation.periodeSetoranRutin}>
                  <FormControlLabel value="bulanan" control={<Radio color="primary" />} label="Bulanan" />
                  <FormControlLabel value="tahunan" control={<Radio color="primary" />} label="Tahunan" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>

          <Grid xs={12} item container justify='flex-start'>
            <Grid xs={12} item container justify='flex-start'>
              <Typography style={{ fontWeight: 'bold' }}>Periode Investasi (Tahun)</Typography>
            </Grid>
            <Grid xs={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="reduce"
                >
                  <RemoveIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid xs={8} item container justify='flex-start'>
              <TextField
                value={simulation.periodeInvestasi}
                variant='outlined'
                // InputProps={{
                //   endAdornment: <InputAdornment position="start">Tahun</InputAdornment>,
                // }}
                inputProps={{
                  style: {
                    textAlign: 'center'
                  }
                }}
                size='small'
              />
            </Grid>
            <Grid xs={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="increase"
                >
                  <AddIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>

          <Grid xs={12} item container justify='flex-start'>
            <Grid xs={12} item container justify='flex-start'>
              <Typography style={{ fontWeight: 'bold' }}>Suku Bunga (%)</Typography>
            </Grid>
            <Grid xs={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="reduce"
                >
                  <RemoveIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid xs={8} item container justify='flex-start'>
              <TextField
                value={simulation.sukuBunga}
                variant='outlined'
                // InputProps={{
                //   endAdornment: <InputAdornment position="start">%</InputAdornment>,
                // }}
                inputProps={{
                  style: {
                    textAlign: 'center'
                  }
                }}
                size='small'
              />
            </Grid>
            <Grid xs={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="increase"
                >
                  <AddIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>

          <Grid xs={12} item container justify='flex-start'>
            <Grid xs={12} item container justify='flex-start'>
              <Typography style={{ fontWeight: 'bold' }}>Frekuensi Bunga</Typography>
            </Grid>
            <Grid xs={12} item container>
              <FormControl>
                <RadioGroup row name="gender" value={simulation.frekuensiBunga}>
                  <FormControlLabel value="harian" control={<Radio color="primary" />} label="Harian" />
                  <FormControlLabel value="bulanan" control={<Radio color="primary" />} label="Bulanan" />
                  <FormControlLabel value="tahunan" control={<Radio color="primary" />} label="Tahunan" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>

        </Grid>
        <Grid xs={10} item container justify='center'>
          <Typography style={{ fontWeight: 'bold' }}>PROYEKSI SALDO</Typography>
        </Grid>
        <Grid xs={10} item container justify='center'>
          <Typography style={{ fontWeight: 'bold' }}>Rp. {proyeksiSaldo}</Typography>
        </Grid>
      </Grid>
    </div>
  )
}
