// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { store } from '../store'
import { PhonebookContact, PhonebookSearchResult } from '../types/phonebook'

export const PAGE_SIZE = 50

/**
 * phonebook search
 */
export async function searchPhonebook(
  pageNum: number,
  textFilter: string,
  contactType: string,
  pageSize: number = PAGE_SIZE,
) {
  try {
    const { baseURL, headers } = store.getState().fetchDefaults
    let apiUrl = `${baseURL}/phonebook/search/${textFilter.trim()}`
    const offset = (pageNum - 1) * pageSize
    apiUrl += `?offset=${offset}&limit=${pageSize}&view=${contactType}`

    const response = await fetch(apiUrl, {
      headers: { ...headers },
    })
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const data = await response.json()
    return mapPhonebookResponse(data)
  } catch (error: any) {
    throw new Error(error)
  }
}

/**
 *
 * @param phonebookResponse the response from the phonebook API
 * @returns
 */
export const mapPhonebookResponse = (phonebookResponse: PhonebookSearchResult) => {
  phonebookResponse.rows = phonebookResponse.rows.map((contact: PhonebookContact) => {
    return mapContact(contact)
  })

  // total pages
  phonebookResponse.totalPages = Math.ceil(phonebookResponse.count / PAGE_SIZE)
  return phonebookResponse
}

export function mapContact(contact: PhonebookContact) {
  // kind & display name
  if (contact.name) {
    contact.kind = 'person'
    contact.displayName = contact.name
  } else {
    contact.kind = 'company'
    contact.displayName = contact.company
  }

  // company contacts
  if (contact.contacts) {
    contact.contacts = JSON.parse(contact.contacts)
  }
  return contact
}

export function getMainPhoneNumber(contact: PhonebookContact): string {
  if (contact.extension) {
    return contact.extension
  } else if (contact.workphone) {
    return contact.workphone
  } else if (contact.cellphone) {
    return contact.cellphone
  }
  return ''
}

export function getTotalPhoneNumbers(contact: PhonebookContact) {
  const phoneNumbers = [contact.extension, contact.workphone, contact.cellphone].filter(
    (number) => number,
  )
  return phoneNumbers.length
}
