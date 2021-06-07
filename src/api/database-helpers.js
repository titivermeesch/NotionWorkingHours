import axios from 'axios'
import dayjs from 'dayjs'
import dayjsDuration from 'dayjs/plugin/duration.js'
import dayjsUtc from 'dayjs/plugin/utc.js'
import { getWorkingHourOwner } from '../helpers/author-helpers.js'
import {
  getPageDate,
  isPageHoliday,
  isPageSickDay,
  isPageVacation,
} from '../helpers/date-helpers.js'

dayjs.extend(dayjsDuration)
dayjs.extend(dayjsUtc)

/**
 *
 * @param {number} month - Month to get working hours from (0 - 11)
 */
const getWorkingHoursDatabase = async (
  month = dayjs().get('month'),
  year = 2021
) => {
  const startOfMonth = dayjs
    .utc()
    .month(month)
    .year(year)
    .startOf('month')
    .toDate()
  const endOfMonth = dayjs.utc().month(month).year(year).endOf('month').toDate()

  const res = await axios({
    method: 'POST',
    url:
      'https://api.notion.com/v1/databases/1eaa0c6723d54729b59280294172d835/query',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_SECRET}`,
      'Notion-Version': '2021-05-13',
    },
    data: {
      filter: {
        and: [
          {
            property: 'Date',
            date: {
              on_or_after: startOfMonth,
            },
          },
          {
            property: 'Date',
            date: {
              on_or_before: endOfMonth,
            },
          },
        ],
      },
    },
  })

  return res.data.results.map(page => {
    const worker = getWorkingHourOwner(page)
    const date = getPageDate(page)

    if (isPageHoliday(page)) {
      return { isHoliday: true, worker, date, holiday: isPageHoliday(page) }
    }

    if (isPageSickDay(page)) {
      return { isSick: true, worker, date }
    }

    if (isPageVacation(page)) {
      return { isVacation: true, worker, date }
    }

    const timeIn = page.properties['Time In'].rich_text[0]?.text.content
    const timeOut = page.properties['Time Out'].rich_text[0]?.text.content

    let diff = ''
    if (timeIn && timeOut) {
      const [timeInHours, timeInMinutes] = timeIn.split(':')
      const [timeOutHours, timeOutMinutes] = timeOut.split(':')

      const timeInDate = dayjs().hour(timeInHours).minute(timeInMinutes)
      const timeOutDate = dayjs().hour(timeOutHours).minute(timeOutMinutes)

      diff = timeOutDate.diff(timeInDate, 'hours', true)
    }

    return {
      date,
      worker,
      timeIn,
      timeOut,
      diff,
    }
  })
}

export { getWorkingHoursDatabase }
