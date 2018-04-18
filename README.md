Web Application to Monitor Stats using C3.js for charts
1. meteor npm install --save babel-runtime (Require by newer version of meteor 1.4.x)
2. meteor add peernohell:c3  (Use c3 for graph/char )
3. meteor add session  (needed for newer version of meteor)
4. meteor add iron:router  (Use iron router)
5. meteor add mizzao:bootstrap-3 (needed for nav-bar)
6. npm install -g pg (postgres db access. IMPORTANT: also need to have NODE_PATH exported)
   - Use this instead: meteor add austinrivas:postgresql
   - This is a wrapper on pg module
7. meteor add mrt:underscore-string-latest (needed for _sprintf)
8. meteor add aldeed:tabular
9. meteor add momentjs:moment
10. meteor add tsega:bootstrap3-datetimepicker
11. Check this: meteor add meteorhacks:search-source
12. Needed for uploading/reading file from client to server
   meteor add cfs:standard-packages
   meteor add cfs:filesystem
13. meteor add keryi:meteor-dcaccordion

Add React.js: see https://guide.meteor.com/react.html
1. meteor npm install --save react react-dom
2. To use 3rd react component:
   meteor npm install --save them and import from within your app
   e.g. meteor npm install --save griddle-react

Full Blown React:
1. meteor npm install --save "react-router-dom"
2. meteor npm install --save "react-redux"

React Component in Blaze
1.  meteor add react-template-helper
1.  meteor add react-meteor-data  (for integrating meteor data system)
