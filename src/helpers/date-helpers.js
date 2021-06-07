import dayjs from 'dayjs'
import dayjsUtc from 'dayjs/plugin/utc.js'
import holidays from '../data/holidays2021.js'

dayjs.extend(dayjsUtc)

const getPageDate = page => {
  return page.properties.Date.date.start
}

const isPageSickDay = page => {
  const pageName = page.properties.Name.title[0].text.content.toLowerCase()

  return pageName?.includes('sick')
}

const isPageVacation = page => {
  const pageName = page.properties.Name.title[0].text.content.toLowerCase()

  return (
    pageName?.includes('holiday') ||
    pageName?.includes('congé') ||
    pageName?.includes('vacation')
  )
}

const isPageHoliday = page => {
  const date = getPageDate(page)

  if (!date) {
    return false
  }

  const realDate = dayjs.utc(date)

  const correspondingHoliday = holidays.find(holiday => {
    const sameDay = realDate.date() === parseInt(holiday.month_day, 10)
    const sameMonth = realDate.month() + 1 === parseInt(holiday.month, 10)

    return sameDay && sameMonth
  })

  return correspondingHoliday
}

const isBusinessDay = date => {
  const workingWeekdays = [1, 2, 3, 4, 5]

  if (workingWeekdays.includes(date.day())) {
    return true
  }

  return false
}

const businessDaysInMonth = date => {
  let currentDay = date.startOf('month')
  const monthEnd = date.endOf('month')
  const businessDays = []
  let monthComplete = false

  while (!monthComplete) {
    if (isBusinessDay(currentDay)) {
      businessDays.push(currentDay.clone())
    }

    currentDay = currentDay.add(1, 'day')

    if (currentDay.isAfter(monthEnd)) {
      monthComplete = true
    }
  }

  return businessDays.length
}

export {
  getPageDate,
  isPageHoliday,
  isPageSickDay,
  isPageVacation,
  businessDaysInMonth,
}
