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
