import { withPluginApi } from 'discourse/lib/plugin-api';
import { default as discourseComputed } from 'discourse-common/utils/decorators';

export default {
  name: 'topic-template-init',
  initialize (container) {
    withPluginApi ('0.8.12', api => {
      api.modifyClass ('component:d-editor', {
        @discourseComputed ('placeholder')
        placeholderTranslated (placeholder) {
          const placeholder_indicator = settings.topic_template_placeholder_indicator
            ? settings.topic_template_placeholder_indicator
            : '[placeholder]';
          if (placeholder) {
            if (placeholder.indexOf (placeholder_indicator) == 0) {
              return placeholder.replace (placeholder_indicator, '');
            }
          }
          return this._super ();
        },
      });
      api.modifyClass ('component:composer-editor', {
        @discourseComputed ('composer.requiredCategoryMissing')
        replyPlaceholder (requiredCategoryMissing) {
          if (!(this.topic !== null && settings.only_apply_on_first_post)) {

            const category_id = this.composer._categoryId;
            const category = this.site.categories.findBy ('id', category_id);
            const placeholder_indicator = settings.topic_template_placeholder_indicator
              ? settings.topic_template_placeholder_indicator
              : '[placeholder]';

            if (category && category.topic_template != null && category.topic_template != "") {
              if (
                settings.display_all_topic_templates_as_placeholders ||
                category.topic_template.indexOf (placeholder_indicator) == 0
              ) {
                return category.topic_template.indexOf (
                  placeholder_indicator
                ) == 0
                  ? category.topic_template
                  : `${placeholder_indicator}${category.topic_template}`;
              }
            }
          }
          return this._super ();
        },
      });
      api.modifyClass ('model:composer', {
        applyTopicTemplate (oldCategoryId, categoryId) {
          this._super (oldCategoryId, categoryId);

          const category = this.site.categories.findBy("id", categoryId);

          const placeholder_indicator = settings.topic_template_placeholder_indicator
            ? settings.topic_template_placeholder_indicator
            : '[placeholder]';

          if (
            (settings.display_all_topic_templates_as_placeholders ||
              this.get ('reply').indexOf (placeholder_indicator) == 0) &&
            category.topic_template != null &&
            category.topic_template == this.get ('reply')
          ) {
            this.set ('reply', '');
          }
        },
      });
    });
  },
};
