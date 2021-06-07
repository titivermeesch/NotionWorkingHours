const getWorkingHourOwner = page => {
  const rawAuthor = page.properties.Name.title[0].text.content

  if (rawAuthor.toLowerCase().includes('lennert')) {
    return 'lennert'
  }

  if (rawAuthor.toLowerCase().includes('tristan')) {
    return 'tristan'
  }

  return 'unknown'
}

export { getWorkingHourOwner }
