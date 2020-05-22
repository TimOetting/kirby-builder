<template>
  <div :class="[
      'kBuilderBlock',
      'kBuilderBlock--col-' + columnsCount,
      'kBuilderBlock--type-' + value._key,
      { 'kBuilderBlock--previewMode': showPreview && expanded },
      { 'kBuilderBlock--expanded': expanded },
      { 'kBuilderBlock--pending': isNew },
      { 'kBuilderBlock--collapsed': !expanded },
      { 'kBuilderBlock--editMode': !showPreview && expanded }
    ]">
    <div :class="
        'kBuilderBlock__header kBuilderBlock__header--col-' + columnsCount
      ">
      <k-icon
        type="sort"
        :class="
          'kBuilder__dragDropHandle kBuilder__dragDropHandle--col-' +
            columnsCount
        "
      />
      <span
        class="kBuilderBlock__label"
        @click="toggleExpand"
      >
        <k-icon
          class="kBuilderBlock__expandedIcon"
          :class="{ 'kBuilderBlock__expandedIcon--expanded': expanded }"
          type="angle-down"
        />
        <span v-html="title(value)"></span>
      </span>
      <div class="kBuilderBlock__actions">
        <k-button-group class="kBuilderBlock__actionsGroup">
          <k-button
            v-if="fieldSets.length > 1 || fieldGroup.preview"
            v-for="fieldSet in fieldSets"
            :key="'showFierldSetButton-' + _uid + fieldSet.key"
            :icon="tabIcon(fieldSet.icon)"
            :image="tabImage(fieldSet.icon)"
            @click="
              displayFieldSet(fieldSet.key);
              toggleExpand(true);
            "
            class="kBuilderBlock__actionsButton"
            :class="[
              {
                'kBuilderBlock__actionsButton--active':
                  activeTab == fieldSet.key && expanded
              },
              `kBuilderBlock__actionsButton--type-${fieldSet.key}`
            ]"
          >{{ fieldSet.label }}</k-button>
          <k-button
            v-if="fieldGroup.preview"
            icon="preview"
            @click="displayPreview()"
            class="kBuilderBlock__actionsButton kBuilderBlock__actionsButton--preview"
            :class="{
              'kBuilderBlock__actionsButton--active': showPreview && expanded
            }"
          >{{ $t("builder.preview") }}</k-button>
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
                @click="
                  $emit('clone', index, showPreview, expanded, activeTab)
                "
              >{{ $t("builder.clone") }}</k-dropdown-item>
              <k-dropdown-item
                icon="trash"
                @click="$emit('delete', index)"
              >{{
                $t("delete")
              }}</k-dropdown-item>
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
        :styles="cssContent"
        :index="index"
        :script="script"
        ref="preview"
      ></builder-preview>
      <k-fieldset
        v-show="!showPreview"
        v-if="activeTab === fieldSet.key"
        v-for="fieldSet in fieldSets"
        class="kBuilderBlock__form"
        v-model="fieldSet.model"
        :value="{}"
        :fields="fieldSet.fields"
        :validate="false"
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
    value: Object,
    blockConfig: Object,
    fieldGroup: Object,
    readyFieldGroup: Object,
    index: Number,
    label: String,
    columnsCount: Number,
    pageUid: String,
    pageId: String,
    encodedPageId: String,
    script: String,
    parentPath: String,
    canDuplicate: Boolean,
    cssContent: String
  },
  data() {
    return {
      pending: true,
      activeTab: null,
      expanded: true,
      isNew: false,
      previewFrameContent: null,
      previewHeight: 0,
      previewStored: false,
      previewMarkup: "",
      showPreview: false,
      fieldGroup: {},
      styles: null
    };
  },
  components: {
    BuilderPreview
  },
  mounted() {
    if (!this.value._uid) {
      this.value._uid =
        this.value._key + "_" + new Date().valueOf() + "_" + this._uid;
    }
    if (this.blockConfig.expandedInitially != null) {
      this.expanded = this.blockConfig.expandedInitially;
      delete this.blockConfig.expandedInitially;
    }
    if (this.blockConfig.showPreviewInitially) {
      this.showPreview = this.blockConfig.showPreviewInitially;
      delete this.blockConfig.showPreviewInitially;
    }
    let localUiState = JSON.parse(localStorage.getItem(this.localUiStateKey));
    if (localUiState && localUiState.expanded !== null) {
      this.expanded = localUiState.expanded;
    }
    this.initFieldGroup();
  },
  computed: {
    localUiStateKey() {
      return `kBuilder.uiState.${this.value._uid}`;
    },
    localFormGroupKey() {
      return `kBuilder.formGroup.${this.blueprint}`;
    },
    extendedUid() {
      return this.pageId.replace("/", "-") + "-" + this._uid;
    },
    blockPath() {
      return this.parentPath + "+" + this.value._key;
    },
    // This array is used to render the block tabs with k-fieldsets in it
    fieldSets() {
      let fieldSets = [];
      if (this.fieldGroup.tabs) {
        for (let [tabKey, tab] of Object.entries(this.fieldGroup.tabs)) {
          fieldSets.push(this.newFieldSet(tab, tabKey, this.value));
        }
      } else if (this.fieldGroup.fields) {
        fieldSets.push(
          this.newFieldSet(
            this.fieldGroup,
            "content",
            this.value,
            "edit",
            this.$t("edit")
          )
        );
      }
      return fieldSets;
    }
  },
  methods: {
    title(blockValue) {
      return Mustache.render(this.label, blockValue);
    },
    initFieldGroup() {
      let localUiState = JSON.parse(localStorage.getItem(this.localUiStateKey));
      if (Object.keys(this.value).length <= 2) {
        // If array only has _key and _uid and therefore is new
        if (this.fieldGroup.fields) {
          Object.entries(this.fieldGroup.fields).forEach(
            ([fieldKey, fieldConfig]) => {
              this.$set(this.value, fieldKey, fieldConfig.default);
            }
          );
        }
        if (this.fieldGroup.tabs) {
          Object.entries(this.fieldGroup.tabs).forEach(
            ([tabName, tabConfig]) => {
              Object.entries(tabConfig.fields).forEach(
                ([fieldKey, fieldConfig]) => {
                  this.$set(this.value, fieldKey, fieldConfig.default);
                }
              );
            }
          );
        }
      }
      if (!this.activeTab) {
        this.activeTab = this.fieldSets[0].key;
      }
      if (
        this.fieldGroup.defaultView &&
        this.fieldGroup.defaultView != "default" &&
        !this.isNew
      ) {
        if (this.fieldGroup.defaultView == "preview") {
          this.showPreview = true;
        } else {
          this.activeTab = this.fieldGroup.defaultView;
        }
      } else if (localUiState) {
        this.showPreview = localUiState.showPreview;
        this.activeTab = localUiState.activeTab;
      } else {
        this.storeLocalUiState();
      }

      if (this.fieldGroup.preview && this.showPreview && this.expanded) {
        this.displayPreview(this.fieldGroup.preview);
      }
      // this.$emit("input", this.value);
    },
    onBlockInput(event) {
      this.$emit("input", this.value);
    },
    displayPreview() {
      this.showPreview = true;
      this.expanded = true;
      let previewData = {
        preview: this.fieldGroup.preview,
        blockContent: this.value,
        block: this.fieldGroup,
        blockUid: this.extendedUid,
        pageid: this.pageId
      };
      this.$api
        .post("kirby-builder/rendered-preview", previewData)
        .then(res => {
          this.previewMarkup = res.preview;
          this.activeTab = null;
          this.$refs["preview"].resize();
        });
      this.storeLocalUiState();
    },
    displayFieldSet(fieldSetKey) {
      this.showPreview = false;
      this.activeTab = fieldSetKey;
      this.previewHeight = 0;
      this.storeLocalUiState();
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
        activeTab: this.activeTab
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
