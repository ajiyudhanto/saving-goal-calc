import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { Grid, TextField, InputAdornment, Slider, Typography } from '@material-ui/core'
import { withStyles, makeStyles } from '@material-ui/core/styles'
import { debounce } from 'lodash'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const CustomTextField = withStyles({
  root: {
    '& label.Mui-focused': {
      color: '#6FBE44',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#6FBE44',
    },
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: '#6FBE44',
      },
    },
  },
})(TextField);

const PrettoSlider = withStyles({
  root: {
    color: '#6FBE44',
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload) {
    // console.log(payload[0].payload)
    return (
      <div style={{ background: 'white', padding: 10 }}>
        <Typography style={{ fontWeight: 'bolder', color: payload[0].payload.fill }}>{ payload[0].payload.name.split('% ')[1] }</Typography>
        <Typography style={{ fontWeight: 'bolder', color: payload[0].payload.fill }}>{`${payload[0].payload.value} %`}</Typography>
      </div>
    );
  }

  return null;
};

export default function KPR () {
  const [houseCost, setHouseCost] = useState('1.000.000.000')
  const [downPayment, setDownPayment] = useState('10')
  const [totalDP, setTotalDP] = useState('100.000.000')
  const [sukuBunga, setSukuBunga] = useState(70)
  const [sukuBungaCommit, setSukuBungaCommit] = useState(70)
  const [jangkaWaktu, setJangkaWaktu] = useState(10)
  const [jangkaWaktuCommit, setJangkaWaktuCommit] = useState(10)
  const [jumlahPinjaman, setJumlahPinjaman] = useState(0)
  const [pinjamanPerBulan, setPinjamanPerBulan] = useState(0)
  const [totalPinjaman, setTotalPinjaman] = useState(0)
  const [totalBungaPinjaman, setTotalBungaPinjaman] = useState(0)
  const [persentaseTotalKomposisiPokok, setPersentaseTotalKomposisiPokok] = useState(0)
  const [persentaseTotalKomposisiBunga, setPersentaseTotalKomposisiBunga] = useState(0)
  const [isShow, setIsShow] = useState(true)

  useEffect(() => {
    jumlahPinjamanCalc()
  }, [houseCost, downPayment])
  
  // useEffect(() => {
  //   DPCalc()
  // }, [totalDP])
  
  useEffect(() => {
    getPinjamanPerBulan()
  }, [jangkaWaktuCommit, sukuBungaCommit, jumlahPinjaman])

  useEffect(() => {
    getTotalPinjaman()
  }, [jangkaWaktuCommit, pinjamanPerBulan])

  useEffect(() => {
    getTotalBunga()
    // getTotalKomposisiPokok()
  }, [totalPinjaman, jumlahPinjaman])

  useEffect(() => {
    // getTotalKomposisiBunga()
    debouncedGetResult()
  }, [totalBungaPinjaman, totalPinjaman, jumlahPinjaman])

  const getResult = () => {
    setIsShow(false)
    // getTotalBunga()
    getTotalKomposisiPokok()
    getTotalKomposisiBunga()
    setIsShow(true)
  }

  const debouncedGetResult = useCallback(
    debounce(getResult, 100), [totalPinjaman, jumlahPinjaman, totalBungaPinjaman]
  );

  const jumlahPinjamanCalc = () => {
    setJumlahPinjaman(Math.round(Number(houseCost.split('.').join('')) * ((100 - Number(downPayment.replace(/,/g, '.'))) / 100)))
  }

  const getTotalPerTahun = () => {
    return (12 * jangkaWaktuCommit)
  }

  const getBungaPerBulan = () => {
    return (sukuBungaCommit / (12 * 100 * 10))
  }

  const getC3 = () => {
    const totalPerTahun = getTotalPerTahun()
    const bungaPerBulan = getBungaPerBulan()
    return (bungaPerBulan * (Math.pow((1 + bungaPerBulan), totalPerTahun)))
  }

  const getD3 = () => {
    const totalPerTahun = getTotalPerTahun()
    const bungaPerBulan = getBungaPerBulan()
    return ((Math.pow((1 + bungaPerBulan), totalPerTahun)) - 1)
  }

  const getPinjamanPerBulan = () => {
    const c3 = getC3()
    const d3 = getD3()
    const res = jumlahPinjaman * (c3 / d3)
    setPinjamanPerBulan(res)
  }

  const getTotalPinjaman = () => {
    const b7 = getTotalPerTahun()
    setTotalPinjaman(pinjamanPerBulan * b7)
  }

  const getTotalBunga = () => {
    setTotalBungaPinjaman(totalPinjaman - jumlahPinjaman)
  }

  const getTotalKomposisiPokok = () => {
    setPersentaseTotalKomposisiPokok(jumlahPinjaman / totalPinjaman)
  }

  const getTotalKomposisiBunga = () => {
    setPersentaseTotalKomposisiBunga(totalBungaPinjaman / totalPinjaman)
  }

  const onChangeHandler = ({e = '', type = ''}) => {
    if (type === 'hc' && (/^[0-9]*$/.test(e.target.value[e.target.value.length - 1]) || !e.target.value)) {
        const valueNumber = Number(e.target.value.split('.').join(''))
        if (houseCost == 0 && valueNumber) {setHouseCost(e.target.value[1]); totalDPCalc(downPayment, e.target.value[1]); return true}
        if (valueNumber) {setHouseCost(valueNumber.toLocaleString().replace(/,/g, '.')); totalDPCalc(downPayment, valueNumber.toLocaleString().replace(/,/g, '.'));}
        if (!valueNumber) {setHouseCost('0'); totalDPCalc(downPayment, '0')}
    }

    if (type === 'dp' && (/^[0-9,]*$/.test(e.target.value[e.target.value.length - 1]) || !e.target.value)) {
      const comma = e.target.value.split('').findIndex(e => e === ',')
      const findComma = e.target.value.split('').filter(e => e === ',')
      const valueNumber = Number(e.target.value.replace(/,/g, '.'))
      // console.log(valueNumber.toString(), 'v')
      // console.log(comma, 'c')
      if (findComma.length > 1) return false
      if (comma != -1 && comma < e.target.value.length - 2) return false
      if (valueNumber > 100) {setDownPayment('100'); totalDPCalc('100', houseCost); return true}
      if (e.target.value && e.target.value.length == 2 && e.target.value[0] == '0') {setDownPayment(e.target.value[1]); totalDPCalc(e.target.value[1], houseCost); return true}
      if (e.target.value) {setDownPayment(e.target.value); totalDPCalc(e.target.value, houseCost); return true}
      if (!valueNumber) {setDownPayment('0'); totalDPCalc('0', houseCost)}
    }

    if (type === 'tdp' && (/^[0-9]*$/.test(e.target.value[e.target.value.length - 1]) || !e.target.value)) {
      const valueNumber = Number(e.target.value.split('.').join(''))
      if (valueNumber > Number(houseCost.split('.').join(''))) {setTotalDP(houseCost); DPCalc(houseCost); return true}
      if (totalDP == 0 && valueNumber) {setTotalDP(e.target.value[1]); DPCalc(e.target.value[1]); return true}
      if (valueNumber) {setTotalDP(valueNumber.toLocaleString().replace(/,/g, '.')); DPCalc(valueNumber.toLocaleString().replace(/,/g, '.'))}
      if (!valueNumber) {setTotalDP('0'); DPCalc('0')}
    }
  }

  const DPCalc = (val) => {
    let newDP = ((Number(val.split('.').join('')) / Number(houseCost.split('.').join(''))) * 100)
    newDP = Math.round(newDP * 10) / 10
    setDownPayment(newDP.toString().replace('.', ','))
  }

  const totalDPCalc = (dp, hc) => {
    setTotalDP(Math.round((Number(hc.split('.').join('')) * (Number(dp.replace(/,/g, '.')) / 100))).toLocaleString().replace(/,/g, '.'))
  }

  return (
    <>
      <Head>
        <title>Simulasi KPR - Kalkulator Kredit Pemilikan Rumah</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Head>

      <Grid container justify='center'>
        <Grid item container justify='center' xs={11} sm={10} md={7} style={{ paddingLeft: 30, paddingTop: 15 }}>
          <Grid item container className='kpr-left' alignItems='center' xs={4}>
            <Typography>Harga Rumah</Typography>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={8}>
            <Grid item container alignItems='center' xs={1}>
              <Typography>:</Typography>
            </Grid>
            <Grid item container alignItems='center' xs={11}>
              <CustomTextField
                className='text-field'
                variant='outlined'
                size='small'
                value={houseCost}
                onChange={(e) => onChangeHandler({e, type: 'hc'})}
                style={{ width: 250 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={4}>
            <Typography>Down Payment (DP)</Typography>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={8}>
            <Grid item container alignItems='center' xs={1}>
              <Typography>:</Typography>
            </Grid>
            <Grid item container alignItems='center' xs={11}>
              <Grid item container alignItems='center' xs={5} sm={3}>
                <CustomTextField
                  className='text-field'
                  variant='outlined'
                  size='small'
                  value={downPayment}
                  onChange={(e) => onChangeHandler({e, type: 'dp'})}
                  style={{ width: 90, marginRight: 15 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item container alignItems='center' xs={7} sm={9}>
                <CustomTextField
                  className='text-field'
                  // variant='outlined'
                  size='small'
                  value={totalDP}
                  onChange={(e) => onChangeHandler({e, type: 'tdp'})}
                  style={{ width: 150 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={4}>
            <Typography>Jumlah Pinjaman</Typography>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={8}>
            <Grid item container alignItems='center' xs={1}>
              <Typography>:</Typography>
            </Grid>
            <Grid item container alignItems='center' xs={11}>
              <Typography>Rp. { jumlahPinjaman.toLocaleString().replace(/,/g, '.') }</Typography>
            </Grid>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={4}>
            <Grid item container alignItems='center' xs={12} >
              <Typography>Suku Bunga</Typography>
            </Grid>
            <Grid item container alignItems='center' xs={12} >
              <Typography>{ sukuBunga / 10 } %</Typography>
            </Grid>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={8}>
            <Grid item container alignItems='center' xs={1} />
            <Grid item container alignItems='center' xs={11}>
              <PrettoSlider 
                min={10}
                max={130}
                value={sukuBunga}
                onChangeCommitted={(e, n) => setSukuBungaCommit(n)}
                onChange={(e, n) => setSukuBunga(n)}
                marks={[
                  {
                    value: 10,
                    label: '1',
                  },
                  {
                    value: 40,
                    label: '4',
                  },
                  {
                    value: 70,
                    label: '7',
                  },
                  {
                    value: 100,
                    label: '10',
                  },
                  {
                    value: 130,
                    label: '13',
                  }
                ]}
              />
            </Grid>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={4}>
            <Grid item container alignItems='center' xs={12} >
              <Typography>Jangka Waktu Pinjaman</Typography>
            </Grid>
            <Grid item container className='kpr-left' alignItems='center' xs={12} >
              <Typography>{jangkaWaktu} tahun</Typography>
            </Grid>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={8}>
            <Grid item container alignItems='center' xs={1} />
            <Grid item container alignItems='center' xs={11}>
              <PrettoSlider 
                min={0}
                max={35}
                value={jangkaWaktu}
                onChangeCommitted={(e, n) => setJangkaWaktuCommit(n)}
                onChange={(e, n) => setJangkaWaktu(n)}
                marks={[
                  {
                    value: 0,
                    label: '0',
                  },
                  {
                    value: 5,
                    label: '5',
                  },
                  {
                    value: 10,
                    label: '10',
                  },
                  {
                    value: 15,
                    label: '15',
                  },
                  {
                    value: 20,
                    label: '20',
                  },
                  {
                    value: 25,
                    label: '25',
                  },
                  {
                    value: 30,
                    label: '30',
                  },
                  {
                    value: 35,
                    label: '35',
                  },
                ]}
                style={{ color: '#2E91CD' }}
              />
            </Grid>
          </Grid>
          <Grid item container style={{ marginBottom: 30, marginTop: 10 }} xs={12}>
            <Typography variant='h5' style={{ color: '#6FBE44', fontWeight: 'bolder' }}>Ringkasan</Typography>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={4}>
            <Typography>Cicilan Per Bulan</Typography>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={8}>
            <Grid item container alignItems='center' xs={1}>
              <Typography>:</Typography>
            </Grid>
            <Grid item container alignItems='center' xs={11}>
              <Typography style={{ marginRight: 5 }}>Rp.</Typography>
              <Typography style={{ width: 150, textAlign: 'right', overflowX: 'hidden' }}>{ Math.round(pinjamanPerBulan).toLocaleString().replace(/,/g, '.') }</Typography>
            </Grid>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={4}>
            <Typography>Total Pinjaman</Typography>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={8}>
            <Grid item container alignItems='center' xs={1}>
              <Typography>:</Typography>
            </Grid>
            <Grid item container alignItems='center' xs={11}>
              <Typography style={{ marginRight: 5 }}>Rp.</Typography>
              <Typography style={{ width: 150, textAlign: 'right', overflowX: 'hidden' }}>{ Math.round(totalPinjaman).toLocaleString().replace(/,/g, '.') }</Typography>
            </Grid>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={4}>
            <Typography>Total Bunga Pinjaman</Typography>
          </Grid>
          <Grid item container className='kpr-left' alignItems='center' xs={8}>
            <Grid item container alignItems='center' xs={1}>
              <Typography>:</Typography>
            </Grid>
            <Grid item container alignItems='center' xs={11}>
              <Typography style={{ marginRight: 5 }}>Rp.</Typography>
              <Typography style={{ width: 150, textAlign: 'right', overflowX: 'hidden' }}>{ Math.round(totalBungaPinjaman).toLocaleString().replace(/,/g, '.') }</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid container item xs={12} md={5} justify='center' alignItems='center'>
          <Grid container item xs={12} justify='center' alignItems='center'>
            <Typography variant='h6' style={{ fontWeight: 'bolder' }}>ESTIMASI CICILAN PERBULAN</Typography>
          </Grid>
          <Grid container item xs={12} justify='center' alignItems='center'>
            <Typography variant='h6' style={{ position: 'absolute', height: 'calc(400px - 330px)', fontWeight: 500 }}>Rp. { Math.round(pinjamanPerBulan).toLocaleString().replace(/,/g, '.') }/Bulan</Typography>
            {
              isShow ?
                <ResponsiveContainer width="95%" height={400}>
                  <PieChart onMouseEnter={() => console.log("enter")}>
                    <Pie
                      data={[
                        {
                          name: '% Total Komposisi Pokok',
                          value: Math.round(persentaseTotalKomposisiPokok * 100)
                        },
                        {
                          name: '% Total Komposisi Bunga',
                          value: Math.round(persentaseTotalKomposisiBunga * 100)
                        }
                      ]}
                      innerRadius={120}
                      outerRadius={160}
                      fill="#8884d8"
                      paddingAngle={1}
                      dataKey="value"
                    >
                      <Cell fill='#6FBE44' />
                      <Cell fill='#2E91CD' />
                    </Pie>
                    <Tooltip 
                      payload={[
                        {
                          name: '% Total Komposisi Pokok',
                          value: Math.round(persentaseTotalKomposisiPokok * 100)
                        },
                        {
                          name: '% Total Komposisi Bunga',
                          value: Math.round(persentaseTotalKomposisiBunga * 100)
                        }
                      ]}
                      content={<CustomTooltip />} 
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer> : ''
            }
          </Grid>
        </Grid>
        <Grid xs={10} sm={10} item container justify='center' style={{ marginTop: '15px' }} >
          <Typography>Copyright © by <span style={{ color: '#2099d4' }}><Link href='https://investbro.id/'>InvestBro.id</Link></span></Typography>
        </Grid>
      </Grid>
    </>
  )
}