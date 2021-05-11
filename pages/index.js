import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Grid, Typography, TextField, Button, ButtonGroup, RadioGroup, Radio, FormControl, FormControlLabel, Hidden } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts'
import Navbar from '../components/Navbar'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload) {
    return (
      <div style={{ background: 'white', padding: 10 }}>
        <Typography style={{ fontWeight: 'bolder' }}>{ label }</Typography>
        <Typography style={{ color: payload[0].fill }}>{`${payload[0].name} : Rp. ${payload[0].value.toLocaleString(['ban', 'id'])},00`}</Typography>
        <Typography style={{ color: payload[1].fill }}>{`${payload[1].name} : Rp. ${payload[1].value.toLocaleString(['ban', 'id'])},00`}</Typography>
        <Typography style={{ color: 'blue' }}>{`Total : Rp. ${(payload[1].value + payload[0].value).toLocaleString(['ban', 'id'])},00`}</Typography>
      </div>
    );
  }

  return null;
};

export default function Home() {
  const [simulation, setSimulation] = useState({
    setoranAwal: '1.000.000',
    setoranRutin: '100.000',
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
      if ( isNaN(Number(event.target.value)) === true && isNaN(toNumberConverter(event.target.value))) {
        console.log('ini NAN')
      } else if (!event.target.value || toNumberConverter(event.target.value) < 0) {
        newSimulation[event.target.name] = '0'
      } else {
        let localeString = toStringConverter(event.target.value, event.target.name)
        newSimulation[event.target.name] = localeString
      }
    } else {
      newSimulation[event.target.name] = event.target.value
    }
    setSimulation(newSimulation)
  }

  function toNumberConverter (str) {
    let arrTemp = str.split('')
    let newStr = ''
    for (let i = 0; i < arrTemp.length; i++) {
      if (arrTemp[i] !== '.') {
        newStr += arrTemp[i]
      }
    }
    // console.log(Number(newStr))
    return Number(newStr)
  }

  function toStringConverter (str, name) {
    // console.log(str, name)
    let number = toNumberConverter(str)
    if (number >= 1000) {
      let numbersTemp = number.toString().split('')
      let count = 0
      for(let i = numbersTemp.length - 1; i >= 0; i--) {
        count++
        if (count === 3 && i !== 0) {
          count = 0
          numbersTemp.splice(i, 0, '.')
        }
      }
      // console.log(numbersTemp.join(''), 'temp')
      return numbersTemp.join('')
    } else {
      return toNumberConverter(str).toString()
    }
  }

  function changeChart () {
    let chartData = []
    let dateNow = new Date()
    let depositNow = toNumberConverter(simulation.setoranAwal)
    for (let i = 0; i < toNumberConverter(simulation.periodeInvestasi); i++) {
      if (simulation.periodeSetoranRutin === 'bulanan') {
        depositNow += (12 * toNumberConverter(simulation.setoranRutin))
      } else {
        depositNow += (1 * toNumberConverter(simulation.setoranRutin))
      }

      let obj = {
        name: dateNow.getFullYear() + i,
        Deposit: depositNow,
        Interest: total(i + 1) - depositNow
      }
      chartData.push(obj)
    }
    // console.log(chartData, 'cd')
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
    return 1 + ((toNumberConverter(simulation.sukuBunga) / 100) / daysCount())
  }

  function b (period) {
    //nt
    return daysCount() * Number(period)
  }

  function c (period) {
    //compound
    return toNumberConverter(simulation.setoranAwal) * (Math.pow(a(), b(period)))
  }

  function d (period) {
    //future
    let result = (Math.pow(a(), b(period)) - 1) / ((toNumberConverter(simulation.sukuBunga) / 100) / daysCount())
    return result
  }

  function e (period) {
    //future value series
    return d(period) * toNumberConverter(simulation.setoranRutin) * p()
  }

  function total (period) {
    const res = Math.round(e(period) + c(period))
    return res
  }

  function plusMinusHandler (str, plusOrMinus, howMuch) {
    let newNum = 0
    if (plusOrMinus == 'plus') {
      newNum = toNumberConverter(simulation[str]) + howMuch
    } else {
      newNum = toNumberConverter(simulation[str]) - howMuch
    }
    let newStr = toStringConverter(newNum.toString(), str)    
    return newStr
  }

  function sukuBungaCalc () {

  }
  
  return (
    <div className='root'>
      <Head>
        <title>Saving Goal Calculator</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Head>

      {/* <Navbar /> */}
      <Grid container justify='center' alignItems='center'>
        {/* <Hidden smUp>
          <Grid item xs={12} style={{ height: '5vh' }} />
        </Hidden> */}
        <Grid xs={10} sm={3} item container justify='center' alignItems='center'>
          <Grid xs={12} item container justify='flex-start' style={{ marginBottom: '15px' }}>
            <Grid xs={12} item container justify='flex-start'>
              <Typography style={{ fontWeight: 'bold' }}>Setoran Awal (Rupiah)</Typography>
            </Grid>
            <Grid xs={3} sm={3} md={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  style={{ width: '100%' }}
                  aria-label="reduce"
                  onClick={() => {
                    if (Number(simulation.setoranAwal - 100 <= 0)) {
                      setSimulation({...simulation, setoranAwal: '0'})
                    } else {
                      setSimulation({...simulation, setoranAwal: plusMinusHandler('setoranAwal', 'minus', 100) })
                    }
                  }}
                >
                  <RemoveIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid xs={6} sm={6} md={8} item container justify='flex-start' style={{ width: '100%' }}>
              <TextField
                value={simulation.setoranAwal}                
                inputProps={{
                  style: {
                    textAlign: 'center'
                  }
                }}
                style={{ width: '100%' }}
                name='setoranAwal'
                variant='outlined'
                size='small'
                onChange={(event) => onChangeHandler(event)}
              />
            </Grid>
            <Grid xs={3} sm={3} md={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="increase"
                  style={{ width: '100%' }}
                  onClick={() => setSimulation({...simulation, setoranAwal: plusMinusHandler('setoranAwal', 'plus', 100)})}
                >
                  <AddIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>

          <Grid xs={12} item container justify='flex-start' style={{ marginBottom: '5px' }}>
            <Grid xs={12} item container justify='flex-start'>
              <Typography style={{ fontWeight: 'bold' }}>Setoran Rutin (Rupiah)</Typography>
            </Grid>
            <Grid xs={3} sm={3} md={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="reduce"
                  style={{ width: '100%' }}
                  onClick={() => {
                    if (Number(simulation.setoranRutin) - 50 <= 0) {
                      setSimulation({...simulation, setoranRutin: '0'})
                    } else {
                      setSimulation({...simulation, setoranRutin: plusMinusHandler('setoranRutin', 'minus', 50)})
                    }
                  }}
                >
                  <RemoveIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid xs={6} sm={6} md={8} item container justify='flex-start'>
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
                style={{ width: '100%' }}
                variant='outlined'
                size='small'
                name='setoranRutin'
                onChange={(event) => onChangeHandler(event)}
              />
            </Grid>
            <Grid xs={3} sm={3} md={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="increase"
                  style={{ width: '100%' }}
                  onClick={() => setSimulation({...simulation, setoranRutin: plusMinusHandler('setoranRutin', 'plus', 50)})}
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

          <Grid xs={12} item container justify='flex-start' style={{ marginBottom: '15px' }}>
            <Grid xs={12} item container justify='flex-start'>
              <Typography style={{ fontWeight: 'bold' }}>Periode Investasi (Tahun)</Typography>
            </Grid>
            <Grid xs={3} sm={3} md={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="reduce"
                  style={{ width: '100%' }}
                  onClick={() => {
                    if (Number(simulation.periodeInvestasi) - 1 <= 0) {
                      setSimulation({...simulation, periodeInvestasi: '0'})
                    } else {
                      setSimulation({...simulation, periodeInvestasi: plusMinusHandler('periodeInvestasi', 'minus', 1)})
                    }
                  }}
                >
                  <RemoveIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid xs={6} sm={6} md={8} item container justify='flex-start'>
              <TextField
                value={simulation.periodeInvestasi}
                variant='outlined'
                inputProps={{
                  style: {
                    textAlign: 'center'
                  }
                }}
                size='small'
                style={{ width: '100%' }}
                name='periodeInvestasi'
                onChange={(event) => onChangeHandler(event)}
              />
            </Grid>
            <Grid xs={3} sm={3} md={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="increase"
                  style={{ width: '100%' }}
                  onClick={() => setSimulation({...simulation, periodeInvestasi: plusMinusHandler('periodeInvestasi', 'plus', 1)})}
                >
                  <AddIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>

          <Grid xs={12} item container justify='flex-start' style={{ marginBottom: '15px' }}>
            <Grid xs={12} item container justify='flex-start'>
              <Typography style={{ fontWeight: 'bold' }}>Suku Bunga (%)</Typography>
            </Grid>
            <Grid xs={3} sm={3} md={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="reduce"
                  style={{ width: '100%' }}
                  onClick={() => {
                    if (Number(simulation.sukuBunga) - 1 <= 0) {
                      setSimulation({...simulation, sukuBunga: '0'})
                    } else {
                      setSimulation({...simulation, sukuBunga: plusMinusHandler('sukuBunga', 'minus', 1)})
                    }
                  }}
                >
                  <RemoveIcon fontSize="small" style={{ color: 'blue' }} />
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid xs={6} sm={6} md={8} item container justify='flex-start'>
              <TextField
                value={simulation.sukuBunga}
                variant='outlined'                
                inputProps={{
                  style: {
                    textAlign: 'center'
                  }
                }}
                style={{ width: '100%' }}
                size='small'
                name='sukuBunga'
                onChange={(event) => onChangeHandler(event)}
              />
            </Grid>
            <Grid xs={3} sm={3} md={2} item container>
              <ButtonGroup style={{ width: '100%' }}>
                <Button
                  aria-label="increase"
                  style={{ width: '100%' }}
                  onClick={() => setSimulation({...simulation, sukuBunga: plusMinusHandler('sukuBunga', 'plus', 1)})}
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
        <Hidden smDown>
          <Grid item xs={1} />
        </Hidden>
        <Grid xs={10} sm={6} item container justify='center' >
          <Grid xs={12} item container justify='center'>
            <Typography style={{ fontWeight: 'bold' }}>PROYEKSI SALDO</Typography>
          </Grid>
          <Grid xs={12} item container justify='center'>
            <Typography style={{ fontWeight: 'bold' }}>Rp. {proyeksiSaldo},00</Typography>
          </Grid>
          <Grid xs={12} item container justify='center'>
            <ResponsiveContainer width="95%" height={400}>
              <BarChart margin={{ top: 20, right: 0, left: 0, bottom: 50 }} data={ progressChart } >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis width={80} />
                <Tooltip payload={ progressChart } content={<CustomTooltip />} />
                <Legend verticalAlign='bottom' height={5} />
                <Bar dataKey="Deposit" stackId='a' fill="#8884d8" />
                <Bar dataKey="Interest" stackId='a' fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
        <Grid xs={10} sm={10} item container justify='center' style={{ marginTop: '15px' }} >
          <Typography>Copyright © by <span style={{ color: '#2099d4' }}><Link href='https://investbro.id/'>InvestBro.id</Link></span></Typography>
        </Grid>
      </Grid>
    </div>
  )
}
