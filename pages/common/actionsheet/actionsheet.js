module.exports =
  (function (modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
      if (installedModules[moduleId]) {
        return installedModules[moduleId].exports;
      }
      var module = installedModules[moduleId] = {
        i: moduleId,
        l: false,
        exports: {}
      };
      modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

      module.l = true;
      return module.exports;
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.d = function (exports, name, getter) {
      if (!__webpack_require__.o(exports, name)) {
        Object.defineProperty(exports, name, { enumerable: true, get: getter });
      }
    };
    __webpack_require__.r = function (exports) {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      }
      Object.defineProperty(exports, '__esModule', { value: true });
    };
    __webpack_require__.t = function (value, mode) {
      if (mode & 1) value = __webpack_require__(value);
      if (mode & 8) return value;
      if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
      var ns = Object.create(null);
      __webpack_require__.r(ns);
      Object.defineProperty(ns, 'default', { enumerable: true, value: value });
      if (mode & 2 && typeof value != 'string') for (var key in value) __webpack_require__.d(ns, key, function (key) { return value[key]; }.bind(null, key));
      return ns;
    };
    __webpack_require__.n = function (module) {
      var getter = module && module.__esModule ?
        function getDefault() { return module['default']; } :
        function getModuleExports() { return module; };
      __webpack_require__.d(getter, 'a', getter);
      return getter;
    };
    __webpack_require__.o = function (object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
    __webpack_require__.p = "";
    return __webpack_require__(__webpack_require__.s = 1);
  })
    ([
/* 0 */,
      (function (module, exports, __webpack_require__) {

        "use strict";


        Component({
          options: {
            multipleSlots: true,
            addGlobalClass: true
          },
          properties: {
            title: {
              type: String,
              value: ''
            },
            showCancel: {
              type: Boolean,
              value: true
            },
            cancelText: {
              type: String,
              value: '取消'
            },
            maskClass: {
              type: String,
              value: ''
            },
            extClass: {
              type: String,
              value: ''
            },
            maskClosable: {
              type: Boolean,
              value: true
            },
            mask: {
              type: Boolean,
              value: true
            },
            show: {
              type: Boolean,
              value: false
            },
            actions: {
              type: Array,
              value: [],
              observer: '_groupChange'
            }
          },
          methods: {
            _groupChange: function _groupChange(e) {
              if (e.length > 0 && typeof e[0] !== 'string' && !(e[0] instanceof Array)) {
                this.setData({
                  actions: [this.data.actions]
                });
              }
            },
            buttonTap: function buttonTap(e) {
              var _e$currentTarget$data = e.currentTarget.dataset,
                value = _e$currentTarget$data.value,
                groupindex = _e$currentTarget$data.groupindex,
                index = _e$currentTarget$data.index;

              this.triggerEvent('actiontap', { value: value, groupindex: groupindex, index: index });
            },
            closeActionSheet: function closeActionSheet(e) {
              var type = e.currentTarget.dataset.type;

              if (this.data.maskClosable || type) {
                this.setData({
                  show: false
                });
                this.triggerEvent('close');
              }
            }
          }
        });

      })
    ]);