import {
  getByLabelText,
  getByText,
  getByTestId,
  queryByTestId,
} from '@testing-library/dom'

import './smart-image'


function getSmartImageDOM (src, fallback) {
  const dom = document.createElement('smart-image')
  let html=  '<smart-image'
  html += (src)? ` src=${src}` : ''
  html += '/>'
  dom.innerHTML = html
}

describe('smart-image', () => {
  it('create smart image', () => {
   
  })
})
