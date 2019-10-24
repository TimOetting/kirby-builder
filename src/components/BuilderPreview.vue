<template>
  <div class="kBuilderPreview">
    <iframe
      ref="previewFrame"
      class="kBuilderPreview__frame"
      @load="onFrameLoad"
      @sizechange="onResize"
      :style="{height: previewHeight + 'px'}"
    ></iframe>
    <script
      type="text/template"
      ref="previewFrameContent"
    >
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>Kirby Builder Preview</title>
          <style>
            html,body{margin: 0;padding: 0;}
            {{styles}}
          </style>
        </head>
        <body id="kirby-builder-body">
          <div id="kirby-builder-content">
            {{markup}}
          </div>
        </body>
      </html>
    </script>
  </div>
</template>

<script>
export default {
  data() {
    return {
      previewFrameWindow: {},
      previewFrameDocument: {},
      previewHeight: 0
    };
  },
  props: {
    markup: {
      type: String
    },
    styles: {
      type: String
    },
    script: {
      type: String
    },
    cssContent: {
      type: String
    },
    index: {
      type: Number
    }
  },
  mounted() {
    this.$root.$on("blockMoved", this.updateFrameIfEmpty);

    this.previewFrameWindow = this.$refs["previewFrame"].contentWindow;
    this.previewFrameDocument = this.previewFrameWindow.document;
    this.updateContent();
    let scriptCode = `
      sendResizeEvent = function () {
        if (window.frameElement) {
          window.frameElement.dispatchEvent(new CustomEvent('sizechange', { detail: { height: document.documentElement.offsetHeight } }))
        }
      }
      sendResizedEvent = function () {
        console.log('on resize')
      }
    `;
    let nativeCodeTag = document.createElement("script");
    nativeCodeTag.type = "text/javascript";
    nativeCodeTag.innerHTML = scriptCode;
    this.previewFrameDocument
      .getElementsByTagName("body")[0]
      .appendChild(nativeCodeTag);
    this.updateContent();
    if (this.script) {
      let scriptTag = document.createElement("script");
      scriptTag.type = "text/javascript";
      scriptTag.innerHTML = this.script;
      this.previewFrameDocument
        .getElementsByTagName("body")[0]
        .appendChild(scriptTag);
    }
  },
  methods: {
    updateContent() {
      this.$nextTick().then(() => {
        if (this.$refs["previewFrame"]) {
          this.previewFrameWindow = this.$refs["previewFrame"].contentWindow;
          this.previewFrameDocument = this.previewFrameWindow.document;
          this.previewFrameDocument.open();
          this.previewFrameDocument.write(
            this.$refs.previewFrameContent.innerHTML
          );
          this.previewFrameDocument.close();
          this.resize();
        }
      });
    },
    updateFrameIfEmpty() {
      this.$nextTick().then(() => {
        if (this.$refs["previewFrame"]) {
          const contentElement = this.$refs[
            "previewFrame"
          ].contentWindow.document.getElementById("kirby-builder-content");
          if (contentElement === null) {
            this.updateContent();
          }
        }
      });
    },
    onResize(event) {
      this.resize();
    },
    resize() {
      if (this.previewFrameDocument.getElementById) {
        const content = this.previewFrameDocument.getElementById(
          "kirby-builder-body"
        );
        const contentHeight = content.scrollHeight;
        if (contentHeight > 0) {
          this.previewHeight = contentHeight;
        }
      }
    },
    onFrameLoad() {
      this.resize();
    }
  },
  watch: {
    markup(content) {
      this.updateContent();
    },
    styles(styles) {
      this.updateContent();
    },
    index(index) {
      this.updateFrameIfEmpty();
    }
  }
};
</script>

<style lang="stylus" scoped>
  .kBuilderPreview
    font-size 0
    &__frame
      border none
      width 100%
      height 200px
</style>


