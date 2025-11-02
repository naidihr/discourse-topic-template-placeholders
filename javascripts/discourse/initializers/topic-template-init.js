import { apiInitializer } from "discourse/lib/api";
import discourseComputed from "discourse/lib/decorators";
import { i18n } from "discourse-i18n";

export default apiInitializer("1.8.0", (api) => {
  const site = api.container.lookup("site:main");

  // Extend D-Editor component to handle topic template placeholders
  api.modifyClass(
    "component:d-editor",
    (Superclass) =>
      class extends Superclass {
        @discourseComputed("placeholder")
        placeholderTranslated(placeholder) {
          const indicator =
            settings.topic_template_placeholder_indicator || "[placeholder]";
          
          if (placeholder?.startsWith(indicator)) {
            return placeholder.replace(indicator, "");
          }
          
          return placeholder ? i18n(placeholder) : null;
        }
      }
  );

  // Extend composer-editor to apply topic template placeholders per category
  api.modifyClass(
    "component:composer-editor",
    (Superclass) =>
      class extends Superclass {
        @discourseComputed("composer.model.categoryId")
        replyPlaceholder(categoryId) {
          // If topic exists and we only apply templates on first post, use default behavior
          if (this.topic && settings.only_apply_on_first_post) {
            return super.replyPlaceholder;
          }
  
          const category = site.categories.find((cat) => cat.id === categoryId);
          const indicator =
            settings.topic_template_placeholder_indicator || "[placeholder]";
  
          if (category?.topic_template) {
            if (
              settings.display_all_topic_templates_as_placeholders ||
              category.topic_template.startsWith(indicator)
            ) {
              return category.topic_template.startsWith(indicator)
                ? category.topic_template
                : `${indicator}${category.topic_template}`;
            }
          }
  
          return super.replyPlaceholder;
        }
      }
  );

  // Extend composer model to handle topic template application logic
  api.modifyClass(
    "model:composer",
    (Superclass) =>
      class extends Superclass {
        applyTopicTemplate(oldCategoryId, categoryId) {
          super.applyTopicTemplate?.(oldCategoryId, categoryId);
  
          const category = site.categories.find((cat) => cat.id === categoryId);
          const indicator =
            settings.topic_template_placeholder_indicator || "[placeholder]";
  
          if (
            category?.topic_template &&
            (settings.display_all_topic_templates_as_placeholders ||
              this.reply?.startsWith(indicator)) &&
            category.topic_template === this.reply
          ) {
            this.set("reply", "");
          }
        }
      }
  );
});
