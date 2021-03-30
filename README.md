# smart-image
An image element that automatically recovers a failed image on an unstable network using a custom element.

# How to use
## import
``` javascript
import 'smart-image'

```
## attributes
- src: image resource
- fit: same as object-fit (Optional)
- position: same as object-position (Optional)
- lazy: start loading when the image is inside the viewport (Optional)

``` html
<smart-image fit="cover" position="center" src="https://avatars.githubusercontent.com/u/80738866?v=4"/>
```
# Lazy Loading
``` html
<smart-image fit="cover" position="center" src="https://avatars.githubusercontent.com/u/80738866?v=4" lazy />
```
