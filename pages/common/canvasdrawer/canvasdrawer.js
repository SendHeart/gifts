/* global Component wx */

Component({
  properties: {
    painting: {
      type: Object,
      value: {view: []},
      observer (newVal, oldVal) {
        if (!this.data.isPainting) {
          if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
            if (newVal && newVal.width && newVal.height) {
              this.setData({
                showCanvas: true,
                isPainting: true
              })
              this.readyPigment()
            }
          } else {
            if (newVal && newVal.mode !== 'same') {
              this.triggerEvent('getImage', {errMsg: 'canvasdrawer:samme params'})
            }
          }
        }
      }
    }
  },
  data: {
    showCanvas: false,
    width: 100,
    height: 100,
    index: 0,
    imageList: [],
    tempFileList: [],
    isPainting: false
  },
  ctx: null,
  cache: {},
  ready () {
    wx.removeStorageSync('canvasdrawer_pic_cache')
    this.cache = wx.getStorageSync('canvasdrawer_pic_cache') || {}
    this.ctx = wx.createCanvasContext('canvasdrawer', this)
   
  },
  methods: {
    readyPigment () {
      const { width, height, windowHeight, windowWidth,background,views } = this.data.painting
      // 屏幕宽度 375px = 750rpx，1px=2rpx
      // 1px = （750 / 屏幕宽度）rpx；
      // 1rpx = （屏幕宽度 / 750）px;
      this.setData({
        width,
        height,
        windowHeight,
        windowWidth,
        ratio: 750/windowWidth,
        background: background,
      })
      console.log('canvasdrawer readyPigment background:',background,width,height)
     
      const inter = setInterval(() => {
        if (this.ctx) {
          clearInterval(inter)
          this.ctx.clearActions()
          this.ctx.save()
          this.drawRect({
            background: background,
            top: 0,
            left: 0,
            width: width,
            height: height,
          })
          this.getImageList(views)
          this.downLoadImages(0)
        }
      }, 100)
    },
  
    getImageList (views) {
      const imageList = []
      for (let i = 0; i < views.length; i++) {
        if (views[i].type === 'image') {
          imageList.push(views[i].url)
        }
      }
      this.setData({
        imageList
      })
    },
    downLoadImages (index) {
      const { imageList, tempFileList } = this.data
      if (index < imageList.length) {
        console.log('canvasdrawer downLoadImages:',imageList[index])
        this.getImageInfo(imageList[index]).then(file => {
          tempFileList.push(file)
          this.setData({
            tempFileList
          })
          this.downLoadImages(index + 1)
        }).catch(fail =>{
          console.log('canvasdrawer downLoadImages fail:', imageList[index], 'index:', index, ' goods id:', this.data.share_goods_id)
          
          //this.downLoadImages(index)
        })
      } else {
        this.startPainting()
      }
    },
    startPainting:function() {
      const { tempFileList, painting: { views } } = this.data
      for (let i = 0, imageIndex = 0; i < views.length; i++) {
        if (views[i].type === 'image') {
          this.drawImage({
            ...views[i],
            url: tempFileList[imageIndex]
          })
          imageIndex++
        } else if (views[i].type === 'text') {
          if (!this.ctx.measureText) {
            wx.showModal({
              title: '提示',
              content: '当前微信版本过低，无法使用 measureText 功能，请升级到最新微信版本后重试。'
            })
            this.triggerEvent('getImage', {errMsg: 'canvasdrawer:version too low'})
            return
          } else {
            this.drawText(views[i])
          }
        } else if (views[i].type === 'rect') {
          this.drawRect(views[i])
        }
      }
      this.ctx.draw(false, () => {
        console.log('canvasdrawer this.ctx.draw canvasdrawer_pic_cache:', this.cache)
        wx.setStorageSync('canvasdrawer_pic_cache', this.cache)
        this.saveImageToLocal()
      })
    },
    drawImage (params) {
      this.ctx.save()
      const { url, top = 0, left = 0, width = 0, height = 0, borderRadius = 0 } = params
       if (borderRadius) {
         this.ctx.beginPath()
         this.ctx.arc(left + borderRadius, top + borderRadius, borderRadius, 0, 2 * Math.PI)
         this.ctx.fill()
         this.ctx.clip()
         this.ctx.drawImage(url, left, top, width, height)
         console.log('canvasdrawer drwImge borderRadius:', borderRadius)
      } else {
        this.ctx.drawImage(url, left, top, width, height)
      }
      this.ctx.restore()
    },
    drawText (params) {
      this.ctx.save()
      const {
        MaxLineNumber = 2,
        breakWord = false,
        color = 'black',
        content = '',
        fontSize = 16,
        top = 0,
        left = 0,
        lineHeight = 20,
        textAlign = 'left',
        width,
        bolder = false,
        textDecoration = 'none'
      } = params
      this.ctx.beginPath()
      this.ctx.setTextBaseline('top')
      this.ctx.setTextAlign(textAlign)
      this.ctx.setFillStyle(color)
      this.ctx.setFontSize(fontSize)
      //this.ctx.setFontSize(content.font)

      if (!breakWord) {
        if (textAlign=='center'){
          let text_left = parseInt((this.data.width - this.ctx.measureText(content).width)/2 )
          this.ctx.fillText(content, text_left, top)
          this.drawTextLine(text_left, top, textDecoration, color, fontSize, content)
         
        }else{
          this.ctx.fillText(content, left, top)
          this.drawTextLine(left, top, textDecoration, color, fontSize, content)
        }
        //console.log('drawText() !breakWord content:', content, 'windowWidth:', this.data.width, 'content len:', this.ctx.measureText(content).width, 'textAlign:', textAlign, 'text_left:', left, 'textDecoration:', textDecoration)
      } else {
        let fillText = ''
        let fillTop = top
        let lineNum = 1
        //console.log('drawText() breakWord content:', content, content.length, this.ctx.measureText(fillText).width,width)
        for (let i = 0; i < content.length; i++) {
          fillText += [content[i]]
          //console.log('drawText() breakWord content:', content, content.length, this.ctx.measureText(fillText).width, width)
          if (this.ctx.measureText(fillText).width > width) {
            if (lineNum === MaxLineNumber) {
              if (i !== content.length) {
                fillText = fillText.substring(0, fillText.length - 1) + '...' 
                this.ctx.fillText(fillText, left, fillTop)
                this.drawTextLine(left, fillTop, textDecoration, color, fontSize, fillText)
                fillText = ''
                break
              }
            }
            this.ctx.fillText(fillText, left, fillTop)
            this.drawTextLine(left, fillTop, textDecoration, color, fontSize, fillText)
            fillText = ''
            fillTop += lineHeight
            lineNum ++
          }
        }
        this.ctx.fillText(fillText, left, fillTop)
        this.drawTextLine(left, fillTop, textDecoration, color, fontSize, fillText)
      }
      
      this.ctx.restore()

      if (bolder) {
        this.drawText({
          ...params,
          left: left + 0.3,
          top: top + 0.3,
          bolder: false,
          textDecoration: 'none' 
        })
      }
    },

    getContent(detail, length = 24, row = 2) {
      let len = 0
      let index = 0
      let content = []
      for (let i = 0; len < detail.length; i++) {
        // 若未定义则致为 ''
        if (!content[index]) content[index] = ''
        content[index] += detail[i]
        // 中文或者数字占两个长度
        if (detail.charCodeAt(i) > 127 || (detail.charCodeAt(i) >= 48 && detail.charCodeAt(i) <= 57)) {
          len += 2;
        } else {
          len++;
        }
        if (len >= length || (row - index == 1 && len >= length - 2)) {
          len = 0
          index++
        }
        if (index === row) break
      }
      return content
    },
    drawTextLine (left, top, textDecoration, color, fontSize, content) {
      if (textDecoration === 'underline') {
        this.drawRect({
          background: color,
          top: top + fontSize * 1.2,
          left: left - 1,
          width: this.ctx.measureText(content).width + 3,
          height: 1
        })
      } else if (textDecoration === 'line-through') {
        this.drawRect({
          background: color,
          top: top + fontSize * 0.6,
          left: left - 1,
          width: this.ctx.measureText(content).width + 3,
          height: 1
        })
      }
    },
    drawRect (params) {
      this.ctx.save()
      const { background, top = 0, left = 0, width = 0, height = 0 } = params
      this.ctx.setFillStyle(background)
      this.ctx.fillRect(left, top, width, height)
      this.ctx.restore()
    },
    getImageInfo (url) {
      return new Promise((resolve, reject) => {
        if (this.cache[url]) {
          console.log(' canvasdrawer getImageInfo() cache[url]:', this.cache[url],'url:',url)
          resolve(this.cache[url])
        } else {
          const objExp = new RegExp(/^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/)
          //const objExp2 = new RegExp(/^http:\/\/store\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/)
          //const objExp3 = new RegExp(/^wxfile:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/)
          wx.getImageInfo({
            src: url,
            complete: res => {
              if (res.errMsg === 'getImageInfo:ok') {
                this.cache[url] = res.path
                resolve(res.path)
              } else {
                console.log('getImageInfo complete error url:', url, 'res:', res)
                //console.log('res:', res)
                const fs = wx.getFileSystemManager()
                fs.getSavedFileList({
                  success(res) {
                    console.log('canvasdrawer getSavedFileList 缓存文件列表', res)
                    for (var i = 0; i < res.fileList.length; i++) {
                      fs.removeSavedFile({
                        filePath: res.fileList[i]['filePath'],
                        success(res) {
                          console.log('canvasdrawer getImageInfo 缓存清除成功', res)
                        },
                        fail(res) {
                          console.log(' canvasdrawergetImageInfo 缓存清除失败', res)
                        },
                      })
                    }

                  },
                  fail(res) {
                    console.log(' canvasdrawer getSavedFileList 缓存文件列表查询失败', res)
                  }
                })
                this.triggerEvent('getImage', { errMsg: 'canvasdrawer:download fail' })
                reject(new Error(' canvasdrawer getImageInfo fail'))
              }
            },
            fail:res=>{
              console.log(' canvasdrawer wx.getImageInfo 接口调用失败', res)
            }
          })
          if (objExp.test(url)) {
            
          } else {
            console.log('canvasdrawer getImageInfo cache url already:', url)
            //this.cache[url] = url
            //resolve(url)
          }
        }
      })
    },
    saveImageToLocal () {
      const { width, height } = this.data
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width,
        height,
        canvasId: 'canvasdrawer',
        complete: res => {
          if (res.errMsg === 'canvasToTempFilePath:ok') {
            this.setData({
              showCanvas: false,
              isPainting: false,
              imageList: [],
              tempFileList: []
            })
            this.triggerEvent('getImage', {tempFilePath: res.tempFilePath, errMsg: 'canvasdrawer:ok'})
          } else {
            this.triggerEvent('getImage', {errMsg: 'canvasdrawer:fail'})
          }
        }
      }, this)
    }
  }
})
