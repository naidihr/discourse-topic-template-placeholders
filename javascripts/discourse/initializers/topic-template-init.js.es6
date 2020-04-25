import {withPluginApi} from 'discourse/lib/plugin-api';
import {
  on,
  default as discourseComputed,
} from 'discourse-common/utils/decorators';

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
          if (
            typeof placeholder !== undefined &&
            placeholder != null &&
            placeholder != ''
          ) {
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
          const container = Discourse.__container__;
          const controller = container.lookup (
            'controller:navigation/category'
          );
          const category = controller.get ('category');
          const placeholder_indicator = settings.topic_template_placeholder_indicator
            ? settings.topic_template_placeholder_indicator
            : '[placeholder]';
          if (category && category.topic_template != '') {
            if (
              settings.display_all_topic_templates_as_placeholders ||
              category.topic_template.indexOf (placeholder_indicator) == 0
            ) {
              return category.topic_template;
            }
          }
          return this._super ();
        },
      });
      api.modifyClass ('model:composer', {
        applyTopicTemplate (oldCategoryId, categoryId) {
          this._super ();

          const placeholder_indicator = settings.topic_template_placeholder_indicator
            ? settings.topic_template_placeholder_indicator
            : '[placeholder]';
          if (this.get ('reply').indexOf (placeholder_indicator) == 0) {
            this.set ('reply', '');
          }
        },
      });
    });
  },
};