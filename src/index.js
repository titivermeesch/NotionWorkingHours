import dayjs from 'dayjs'
import { getWorkingHoursDatabase } from './api/database-helpers.js'
import { businessDaysInMonth } from './helpers/date-helpers.js'

const getHourStructureForWorker = (workingHours, worker) => {
  const generalHolidays = workingHours.filter(d => d.isHoliday).length
  const workingDays =
    businessDaysInMonth(dayjs(workingHours[0].date)) - generalHolidays

  const workerHours = workingHours.filter(wh => wh.worker === worker)
  const workedDays = workerHours.filter(wh => wh.timeIn)
  const workedHours = workerHours.reduce((acc, curr) => {
    if (curr.isHoliday || curr.isSick || curr.isVacation) {
      acc += 7.6
    } else {
      acc += curr.diff
    }

    // Midday lunch
    acc -= 0.5

    return acc
  }, 0)

  return {
    workedDays: workedDays.length,
    workedHours,
    averageHourPerDay: workedHours / workedDays.length,
    requiredWorkedHoursInMonth: workingDays * 7.6,
    afterHours: workedHours - workingDays * 7.6,
    sickDays: workerHours.filter(wh => wh.isSick).length,
    vacationDays: workerHours.filter(wh => wh.isVacation).length,
  }
}

const run = async (month = 0) => {
  const workingHours = await getWorkingHoursDatabase(month)

  const generalHolidays = workingHours.filter(d => d.isHoliday).length
  const workingDays =
    businessDaysInMonth(dayjs().month(month)) - generalHolidays

  console.log(`INSIGHT OF ${dayjs().month(month).format('MMMM')}`, {
    general: {
      workingDays,
      holidayDays: generalHolidays,
    },
    lennert: getHourStructureForWorker(workingHours, 'lennert'),
    tristan: getHourStructureForWorker(workingHours, 'tristan'),
  })
}

;(async () => {
  await run(0)
  await run(1)
  await run(2)
  await run(3)
  await run(4)
})()
