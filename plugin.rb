# frozen_string_literal: true
# transpile_js: true

# name: Karma
# about: Show karma stats onto the user's profile
# version: 1.0.2
# authors: Karma
# url: https://github.com/show-karma/discourse-plugin
# required_version: 2.8.7

enabled_site_setting :Enable_Karma_plugin

register_asset "stylesheets/karma-score.scss"
register_asset "stylesheets/proposal-banner.scss"

after_initialize do
end
