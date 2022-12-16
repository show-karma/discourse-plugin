# frozen_string_literal: true
# transpile_js: true

# name: Karma
# about: Show karma stats onto the user's profile
# version: 1.0.2
# authors: Karma
# url: https://github.com/show-karma/discourse-plugin
# required_version: 2.8.7

enabled_site_setting :Enable_Karma_plugin

register_asset "stylesheets/_variables.scss"
register_asset "stylesheets/karma-score.scss"
register_asset "stylesheets/proposal-banner.scss"
register_asset "stylesheets/vote-reason-form.scss"

after_initialize do
  module ::KarmaScore
    PLUGIN_NAME ||= "KarmaScore"

    class Engine < ::Rails::Engine
      engine_name PLUGIN_NAME
      isolate_namespace KarmaScore
    end

    class Error < StandardError; end
  end

  require_relative "app/controllers/karma_controller.rb"

  KarmaScore::Engine.routes.draw do
    get "/allowance" => "karma#is_api_allowed"
    post "/vote-reason" => "karma#save_vote_reason"
    put "/vote-reason" => "karma#save_vote_reason"
    post "/delegate-pitch" => "karma#save_delegate_pitch"
    put "/delegate-pitch" => "karma#save_delegate_pitch"
  end

  Discourse::Application.routes.append do
    mount ::KarmaScore::Engine, at: "/karma-score"
  end
end
