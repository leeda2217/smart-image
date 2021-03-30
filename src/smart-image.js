
const LOAD_STATE = {
  INIT: 0,
  LAZY_LOAD_WAIT: 1,
  LOADING: 2,
  SUCCESS: 3,
  FAILURE: 4
}

class SmartImage extends HTMLElement {

  static get observedAttributes() {return ['src', 'fit', 'position', 'lazy']; }
  static isOnline = true
  // global IntersectionObserver (view port)
  static io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target
        if (el.state === LOAD_STATE.LAZY_LOAD_WAIT) {
          el._loadImage()
          observer.unobserve(el)
        }
      }
    })
  })


  constructor () {
    super()
    this.lazyMode = false
    this.state = LOAD_STATE.INIT

    this._src = ''
    this.manualRecovery = false
  }

  connectedCallback () {
    this.innerHTML = `
<img class="smart-image-internal">
`
    this._img = this.querySelector('.smart-image-internal')

    this._img.onload = () => {
      this.state = (this._img.complete)? LOAD_STATE.SUCCESS : LOAD_STATE.FAILURE
      this._show()
      this.dispatchEvent(new CustomEvent('load'))
    }

    this._img.onerror = () => {
      this.state = LOAD_STATE.FAILURE
      this._hide()
      this.dispatchEvent(new CustomEvent('error'))
    }

    SmartImage.observedAttributes.forEach((key) => {
      if (this.hasAttribute(key)) {
        const value = this.getAttribute(key)
        this._updateAttribute(key, value)
      }
    })
  }

  disconnectedCallback () {
    SmartImage.io.unobserve(this)

    this._img.onload = null
    this._img.onerror = null
    this._img.removeAttribute('src') // network request is canceled when src is removed
    this.removeChild(this._img)
    this._img = null
  }

  adoptedCallback () {
  }

  attributeChangedCallback (name, _oldValue, newValue) {
    this._updateAttribute(name, newValue)
  }

  _updateAttribute (name, value) {

    switch (name) {
      case 'src':
        this.src = value
        break
      case 'manual':
        this.manualRecovery = (value === null)? false: true
        break
      case 'fit':
        if (this._img) {
          this._img.style['object-fit'] = value
        }
        break
      case 'position':
        if (this._img) {
          this._img.style['object-position'] = value
        }
        break
      case 'lazy':
        this.lazyMode = (value === null)? false: true
        if (this.lazyMode === false && this.state === LOAD_STATE.LAZY_LOAD_WAIT) {
          this._loadImage()
        }
        break
      default:
        break
    }
  }

  recovery() {
    if (this.state === LOAD_STATE.FAILURE && this._src && this._img) {
      console.log(`[smart-image] recovery src: ${this._src}`)
      this._loadImage()
    }
  }

  _loadImage () {
    this._hide()
    this.state = LOAD_STATE.LOADING
    this._img.src = this._src
    // NOTE: complete is set immediately when image resource cached
    if (!this._img.complete && !SmartImage.isOnline) {
      this.state = LOAD_STATE.FAILURE
      this._img.removeAttribute('src')
    }
  }

  get src() {
    return this._src
  }

  set src (value) {
    if (this._img && this._src !== value) {
      this._src = value
      // pending when lazy mode
      if (this.lazyMode) {
        this.state = LOAD_STATE.LAZY_LOAD_WAIT
        // NOTE: need to observe again when the element is inside the view
        SmartImage.io.unobserve(this)
        SmartImage.io.observe(this)
      } else {
        this._loadImage()
      }
    }
  }

  _hide () {
    this._img.classList.remove('show')
  }

  _show() {
    this._img.classList.add('show')
  }
}

function runRecovery () {
  const list = []
  window.document.body.querySelectorAll('smart-image').forEach((el) => {
    if (el.state === LOAD_STATE.FAILURE && el.manualRecovery === false) {
      list.push(el)
    }
  })

  if (list.length) {
    console.info(`[smart-image] attempt to recover ${list.length} images`)
    list.forEach(el => {
      el.recovery()
    })
  }
}

function bindEvents () {
  // when the network connection is restored
  window.navigator.connection.onchange = () => {
    if (window.navigator.onLine) {
      runRecovery()
    }
  }
}

export function useSmartImageComponent () {
  if (!window.customElements) {
    console.error('[smart-image] customElements is not supported')
    return
  }

  if (window.customElements.get('smart-image')) {
    return
  }

  document.head.insertAdjacentHTML('beforeend', `
<style type="text/css">
smart-image {
  display: inline-block;
  overflow: hidden;
}
smart-image > img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  opacity: 0;
}
smart-image > .show {
  transition: opacity ease 0.3s;
  opacity: 1;
}
</style>
`)

  window.customElements.define('smart-image', SmartImage)
  bindEvents()
}

useSmartImageComponent()
