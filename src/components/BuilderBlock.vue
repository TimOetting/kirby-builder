<template>
  <div :class="[
    'kBuilderBlock', 
    'kBuilderBlock--col-' + columnsCount, 
    'kBuilderBlock--type-' + block._key,
    {'kBuilderBlock--previewMode': showPreview && expanded }, 
    {'kBuilderBlock--expanded': expanded },
    {'kBuilderBlock--pending': isNew },
    {'kBuilderBlock--collapsed': !expanded },
    {'kBuilderBlock--editMode': !showPreview && expanded }
  ]">
    <div :class="'kBuilderBlock__header kBuilderBlock__header--col-' + columnsCount">
      <k-icon
        type="sort"
        :class="'kBuilder__dragDropHandle kBuilder__dragDropHandle--col-' + columnsCount"
      />
      <span
        class="kBuilderBlock__label"
        @click="toggleExpand"
      >
        <k-icon
          class="kBuilderBlock__expandedIcon"
          :class="{'kBuilderBlock__expandedIcon--expanded': expanded}"
          type="angle-down"
        />
        <span v-html=title></span>
      </span>
      <div class="kBuilderBlock__actions">
        <k-button-group class="kBuilderBlock__actionsGroup">
          <k-button
            v-if="fieldSets.length > 1 || fieldGroup.preview"
            v-for="fieldSet in fieldSets"
            :key="'showFierldSetButton-' + _uid + fieldSet.key"
            :icon="tabIcon(fieldSet.icon)"
            :image="tabImage(fieldSet.icon)"
            @click="displayFieldSet(fieldSet.key); toggleExpand(true)"
            class="kBuilderBlock__actionsButton"
            :class="{'kBuilderBlock__actionsButton--active': (activeFieldSet == fieldSet.key && expanded )}"
          >{{fieldSet.label}}</k-button>
          <k-button
            v-if="fieldGroup.preview"
            icon="preview"
            @click="displayPreview()"
            class="kBuilderBlock__actionsButton"
            :class="{'kBuilderBlock__actionsButton--active': showPreview && expanded}"
          >{{ $t('builder.preview') }}</k-button>
        </k-button-group>
        <div class="kBuilderBlock__control">
          <k-dropdown class="kBuilderBlock__actionsDropDown">
            <k-button
              icon="dots"
              @click="$refs['blockActions'].toggle()"
              class="kBuilderBlock__actionsButton"
            ></k-button>
            <k-dropdown-content
              class="kBuilderBlock__actionsDropDownContent"
              :ref="'blockActions'"
              align="right"
            >
              <k-dropdown-item
                v-if="canDuplicate"
                icon="copy"
                @click="$emit('clone', index, showPreview, expanded, activeFieldSet)"
              >{{ $t('builder.clone') }}</k-dropdown-item>
              <k-dropdown-item
                icon="trash"
                @click="$emit('delete', index)"
              >{{ $t('delete') }}</k-dropdown-item>
            </k-dropdown-content>
          </k-dropdown>
        </div>
      </div>
    </div>
    <div
      class="kBuilderBlock__content"
      v-show="expanded"
    >
      <builder-preview
        v-if="fieldGroup.preview"
        v-show="showPreview"
        :markup="previewMarkup"
        :styles="styles"
        :index="index"
        :script="script"
        ref="preview"
      ></builder-preview>
      <k-fieldset
        v-show="!showPreview"
        v-if="(activeFieldSet === fieldSet.key)"
        v-for="fieldSet in fieldSets"
        class="kBuilderBlock__form"
        v-model="fieldSet.model"
        :value="{}"
        :fields="fieldSet.fields"
        :validate="true"
        v-on="$listeners"
        :key="fieldSet.key + _uid"
      />
    </div>
  </div>
</template>

<script>
import BuilderPreview from "./BuilderPreview.vue";
import Mustache from "mustache";
export default {
  props: {
    endpoints: Object,
    block: Object,
    fieldGroup: Object,
    index: Number,
    columnsCount: Number,
    pageUid: String,
    pageId: String,
    encodedPageId: String,
    styles: String,
    script: String,
    parentPath: String,
    canDuplicate: Boolean
  },
  components: {
    BuilderPreview
  },
  mounted() {
    if (!this.block._uid) {
      this.block._uid =
        this.block._key + "_" + new Date().valueOf() + "_" + this._uid;
    }
    if (!this.activeFieldSet) {
      this.activeFieldSet = this.fieldSets[0].key;
    }
    if (this.block.expandedInitially != null) {
      this.expanded = this.block.expandedInitially;
      delete this.block.expandedInitially;
    }
    if (this.block.showPreviewInitially) {
      this.showPreview = this.block.showPreviewInitially;
      delete this.block.showPreviewInitially;
    }
    if (this.block.activeFieldSetInitially) {
      this.activeFieldSet = this.block.activeFieldSetInitially;
      delete this.block.activeFieldSetInitially;
    }
    if (this.block.isNew) {
      this.isNew = true;
      window.requestAnimationFrame(() => {
        this.isNew = false;
        delete this.block.isNew;
      });
    }
    let localUiState = JSON.parse(localStorage.getItem(this.localUiStateKey));
    if (localUiState && localUiState.expanded !== null) {
      this.expanded = localUiState.expanded;
    }
    if (
      this.fieldGroup.defaultView &&
      this.fieldGroup.defaultView != "default" &&
      !this.isNew
    ) {
      if (this.fieldGroup.defaultView == "preview") {
        this.showPreview = true;
      } else {
        this.activeFieldSet = this.fieldGroup.defaultView;
      }
    } else if (localUiState) {
      this.showPreview = localUiState.showPreview;
      this.activeFieldSet = localUiState.activeFieldSet;
    } else {
      this.storeLocalUiState();
    }

    if (this.fieldGroup.preview && this.showPreview && this.expanded) {
      this.displayPreview(this.fieldGroup.preview);
    }
  },
  data() {
    return {
      pending: true,
      activeFieldSet: null,
      expanded: true,
      isNew: false,
      previewFrameContent: null,
      previewHeight: 0,
      previewStored: false,
      previewMarkup: "",
      showPreview: false
    };
  },
  computed: {
    localUiStateKey() {
      return `kBuilder.uiState.${this.block._uid}`;
    },
    extendedUid() {
      return this.pageId.replace("/", "-") + "-" + this._uid;
    },
    previewUrl() {
      if (this.previewStored) {
        return (
          "kirby-builder-preview/" +
          this.extendedUid +
          "?" +
          this.objectToGetParams(this.fieldGroup.preview) +
          "&pageid=" +
          this.pageId
        );
      } else {
        return null;
      }
    },
    blockPath() {
      return this.parentPath + "+" + this.block._key;
    },
    fieldSets() {
      let fieldSets = [];
      if (this.fieldGroup.tabs) {
        for (const tabKey in this.fieldGroup.tabs) {
          if (this.fieldGroup.tabs.hasOwnProperty(tabKey)) {
            const tab = this.fieldGroup.tabs[tabKey];
            fieldSets.push(this.newFieldSet(tab, tabKey, this.block));
          }
        }
      } else if (this.fieldGroup.fields) {
        fieldSets.push(
          this.newFieldSet(
            this.fieldGroup,
            "content",
            this.block,
            "edit",
            this.$t("edit")
          )
        );
      }
      return fieldSets;
    },
    title() {
      if (!this.fieldGroup.label) {
        return this.fieldGroup.name;
      } else {
        return Mustache.render(this.fieldGroup.label, this.block);
      }
    }
  },
  methods: {
    onBlockInput(event) {
      this.$emit("input", this.val);
    },
    displayPreview() {
      this.showPreview = true;
      this.expanded = true;
      let previewData = {
        preview: this.fieldGroup.preview,
        blockContent: this.block,
        block: this.fieldGroup,
        blockUid: this.extendedUid,
        pageid: this.pageId
      };
      this.$api
        .post("kirby-builder/rendered-preview", previewData)
        .then(res => {
          this.previewMarkup = res.preview;
          this.activeFieldSet = null;
          this.$refs["preview"].resize();
        });
      this.storeLocalUiState();
    },
    displayFieldSet(fieldSetKey) {
      this.showPreview = false;
      this.activeFieldSet = fieldSetKey;
      this.previewHeight = 0;
      this.storeLocalUiState();
    },
    onPreviewLoaded(event) {
      this.previewHeight = event.detail.height;
      this.activeFieldSet = null;
    },
    toggleExpand(expanded) {
      if (typeof expanded === "boolean") {
        this.expanded = expanded;
      } else {
        this.expanded = this.expanded ? false : true;
      }
      if (this.expanded && this.showPreview) {
        this.displayPreview();
      }
      this.storeLocalUiState();
    },
    newFieldSet(fieldSet, key, model, icon, label) {
      Object.keys(fieldSet.fields).forEach(fieldName => {
        const modelEndpoint = this.endpoints.model;
        fieldSet.fields[fieldName].endpoints = {
          field: `kirby-builder/${modelEndpoint}/fields/${this.blockPath}+${fieldSet.fields[fieldName].name}`,
          model: modelEndpoint,
          section: this.endpoints.section
        };

        fieldSet.fields[fieldName].parentPath = this.blockPath;
      });
      let newFieldSet = {
        fields: fieldSet.fields,
        key: key,
        model: model,
        icon: icon || fieldSet.icon || null,
        label: label || fieldSet.label || null
      };
      return newFieldSet;
    },
    objectToGetParams(obj) {
      return Object.keys(obj)
        .map(function(key) {
          return key + "=" + obj[key];
        })
        .join("&");
    },
    storeLocalUiState() {
      let localUiState = {
        expanded: this.expanded,
        showPreview: this.showPreview,
        activeFieldSet: this.activeFieldSet
      };
      localStorage.setItem(this.localUiStateKey, JSON.stringify(localUiState));
    },
    tabIcon(icon) {
      if (!icon) {
        return null;
      }
      const isPath = icon.indexOf("/") > -1 && icon.indexOf(".") > -1;
      return isPath ? null : icon;
    },
    tabImage(icon) {
      if (!icon) {
        return null;
      }
      const isPath = icon.indexOf("/") > -1 && icon.indexOf(".") > -1;
      return isPath ? icon : null;
    }
  }
};
</script>

<style lang="stylus">
.kBuilderBlock {
  background white
  box-shadow 0 2px 5px rgba(22, 23, 26, 0.05)
  position relative
  opacity 1
  transition opacity 0.5s, transform 0.5s

  &--pending {
    opacity 0
    transform translateY(calc(10px + 5%))
    transition opacity 0s, transform 0s
  }

  &__label {
    display flex
    cursor pointer
    height 100%
    align-items center
    flex-grow 1
    height 38px
  }

  &__expandedIcon {
    margin-right 4px
    transform rotate(-90deg)

    &--expanded {
      transform rotate(0)
    }
  }

  &__header {
    font-size 0.875rem
    display flex
    align-items center
    justify-content flex-end
    flex-wrap wrap

    &--col-1 {
      padding-left 0.75rem
    }
  }

  &__actions {
    display flex
  }

  &__actionsGroup {
    margin-right 0

    &.k-button-group>.k-button {
      padding-top 0
      padding-bottom 0
    }
  }

  &__actionsDropDown {
    display inline-block
  }

  &__actionsDropDownContent {
    z-index 2
  }

  &__actionsButton {
    min-width 38px
    height 38px
    opacity 0.4
    color rgb(22, 23, 26)
    font-weight 500

    &:hover {
      opacity 0.7
    }

    &--active {
      pointer-events none
      opacity 1
    }

    .k-button-figure img {
      background-color transparent
      border-radius 0
    }
  }

  &__form {
    padding 0.625rem 0.75rem 2.25rem 0.75rem
  }

  .sortable-drag {
    cursor -webkit-grab
  }

  .kBuilderBlock, .k-structure-table, .k-card, .k-list-item {
    box-shadow 0 2px 5px rgba(22, 23, 26, 0.15), 0 0 0 1px rgba(22, 23, 26, 0.05)
  }

  .k-structure {
    margin-left 25px
  }
}

.k-sortable-ghost > .k-column-content > .kBuilderBlock, 
.k-sortable-ghost > .kBuilderBlock, 
.sortable-ghost > .k-column-content > .kBuilderBlock , 
.sortable-ghost > .kBuilderBlock {
  box-shadow 0 0 0 2px #4271ae, 0 5px 10px 2px rgba(22, 23, 26, 0.25)
}

.k-sortable-ghost > .kBuilderBlock .kBuilderPreview__frame {
  pointer-events none;
}
</style>
