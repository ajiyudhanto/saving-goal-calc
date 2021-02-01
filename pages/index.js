import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Grid, Typography, TextField, Button, ButtonGroup, InputAdornment, RadioGroup, Radio, FormControl, FormControlLabel } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts'

export default function Home() {
  const [simulation, setSimulation] = useState({
    setoranAwal: '1000',
    setoranRutin: '100',
    periodeSetoranRutin: 'bulanan',
    periodeInvestasi: '3',
    sukuBunga: '10',
    frekuensiBunga: 'tahunan'
  })

  const [progressChart, setProgressChart] = useState([])
  const [proyeksiSaldo, setProyeksiSaldo] = useState(0)
  const [modal, setModal] = useState(0)
  const [bunga, setBunga] = useState(0)

  useEffect(() => {
    if (simulation.sukuBunga === '0') {
      let result = 0
      if (simulation.periodeSetoranRutin === 'bulanan') {
        result = Number(simulation.setoranAwal) + (Number(simulation.setoranRutin) * 12 * Number(simulation.periodeInvestasi))
      } else {
        result = Number(simulation.setoranAwal) + (Number(simulation.setoranRutin) * 1 * Number(simulation.periodeInvestasi))
      }
      setProyeksiSaldo(result)
    } else {
      setProyeksiSaldo(total(simulation.periodeInvestasi).toLocaleString(['ban', 'id']))
    }
    changeChart()
  }, [simulation.setoranAwal, simulation.setoranRutin, simulation.periodeSetoranRutin, simulation.periodeInvestasi, simulation.sukuBunga, simulation.frekuensiBunga])

  function onChangeHandler (event) {
    let newSimulation = {...simulation}
    console.log(event.target.value)
    if (event.target.name === 'setoranAwal' || event.target.name === 'setoranRutin' || event.target.name === 'periodeInvestasi' || event.target.name === 'sukuBunga') {
      if ( isNaN(Number(event.target.value)) === true) {
        console.log('ini NAN')
      } else if (!event.target.value || Number(event.target.value) < 0) {
        newSimulation[event.target.name] = '0'
      } else {
        newSimulation[event.target.name] = event.target.value
      }
    } else {
      newSimulation[event.target.name] = event.target.value
    }
    setSimulation(newSimulation)
  }

  function changeChart () {
    let chartData = []
    let dateNow = new Date()
    let depositNow = Number(simulation.setoranAwal)
    let interestNow = 0
    for (let i = 0; i < Number(simulation.periodeInvestasi); i++) {
      if (simulation.periodeSetoranRutin === 'bulanan') {
        depositNow += (12 * Number(simulation.setoranRutin))
      } else {
        depositNow += (1 * Number(simulation.setoranRutin))
      }
      console.log(`total tahun ke-${i + 1}`, total(i + 1))
      console.log(`deposit tahun ke-${i + 1}`, depositNow)
      console.log(`interest tahun ke-${i + 1}`, total(i + 1) - depositNow)
      let obj = {
        name: dateNow.getFullYear() + i,
        deposit: depositNow,
        interest: total(i + 1) - depositNow
      }
      chartData.push(obj)
    }
    
    setProgressChart(chartData)
  }

  function daysCount () {
    let days = 0
    if (simulation.frekuensiBunga === 'tahunan') {
      days = 1
    } else if (simulation.frekuensiBunga === 'bulanan') {
      days = 12
    } else if (simulation.frekuensiBunga === 'harian') {
      days = 365
    }
    return days
  }

  function p () {
    let count = 0
    if (simulation.periodeSetoranRutin === 'bulanan') {
      count = 12
    } else {
      count = 1
    }
    return count / daysCount()
  }

  function a () {
    //1+r/n    
    return 1 + ((Number(simulation.sukuBunga) / 100) / daysCount())
  }

  function b (period) {
    //nt
    return daysCount() * Number(period)
  }

  function c (period) {
    //compound
    return Number(simulation.setoranAwal) * (Math.pow(a(), b(period)))
  }

  function d (period) {
    //future
    let result = (Math.pow(a(), b(period)) - 1) / ((Number(simulation.sukuBunga) / 100) / daysCount())
    return result
  }

  function e (period) {
    //future value series
    return d(period) * Number(simulation.setoranRutin) * p()
  }

  function total (period) {
    const res = Math.round(e(period) + c(period))
    return res
    setProyeksiSaldo((Math.round(e(period) + c(period))).toLocaleString(['ban', 'id']))
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
        <Grid xs={10} sm={3} item container justify='center'>

          <Grid xs={12} item container justify='flex-start'>
            <Grid xs={12} item container justify='flex-start'>
              <Typography style={{ fontWeight: 'bold' }}>Setoran Awal (Rupiah)</Typography>
            </Grid>
            <Grid xs={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  style={{ width: '100%' }}
                  aria-label="reduce"
                  onClick={() => setSimulation({...simulation, setoranAwal: (Number(simulation.setoranAwal) - 100).toString()})}
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
                  style={{ width: '100%' }}
                  onClick={() => setSimulation({...simulation, setoranAwal: (Number(simulation.setoranAwal) + 100).toString()})}
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
                  style={{ width: '100%' }}
                  onClick={() => setSimulation({...simulation, setoranRutin: (Number(simulation.setoranRutin) - 50).toString()})}
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
                name='setoranRutin'
                onChange={(event) => onChangeHandler(event)}
              />
            </Grid>
            <Grid xs={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="increase"
                  style={{ width: '100%' }}
                  onClick={() => setSimulation({...simulation, setoranRutin: (Number(simulation.setoranRutin) + 50).toString()})}
                >
                  <AddIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid xs={12} item container>
              <FormControl>
                <RadioGroup row name="periodeSetoranRutin" onChange={(event) => onChangeHandler(event)} value={simulation.periodeSetoranRutin}>
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
                  style={{ width: '100%' }}
                  onClick={() => setSimulation({...simulation, periodeInvestasi: (Number(simulation.periodeInvestasi) - 1).toString()})}
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
                name='periodeInvestasi'
                onChange={(event) => onChangeHandler(event)}
              />
            </Grid>
            <Grid xs={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="increase"
                  style={{ width: '100%' }}
                  onClick={() => setSimulation({...simulation, periodeInvestasi: (Number(simulation.periodeInvestasi) + 1).toString()})}
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
                  style={{ width: '100%' }}
                  onClick={() => setSimulation({...simulation, sukuBunga: (Number(simulation.sukuBunga) - .25).toString()})}
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
                name='sukuBunga'
                onChange={(event) => onChangeHandler(event)}
              />
            </Grid>
            <Grid xs={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="increase"
                  style={{ width: '100%' }}
                  onClick={() => setSimulation({...simulation, sukuBunga: (Number(simulation.sukuBunga) + .25).toString()})}
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
                <RadioGroup row name="frekuensiBunga" onChange={(event) => onChangeHandler(event)} value={simulation.frekuensiBunga}>
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
        <Grid xs={10} item container justify='center'>
          <Typography style={{ fontWeight: 'bold' }}>{progressChart.toString()}</Typography>
        </Grid>
      </Grid>
    </div>
  )
}
