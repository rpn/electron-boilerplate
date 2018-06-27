/*global Vue */
'use strict'

//------------------------------------------------------
//	main vue
//------------------------------------------------------
new Vue({
  el: '#app',
  template: `
		<div>
			{{message}}
		</div>
	`,
  data: {
    message: 'hello world', 
  },
})
