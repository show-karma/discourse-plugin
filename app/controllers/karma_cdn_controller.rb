# frozen_string_literal: true
require "net/http"
require "uri"

class KarmaScore::KarmaCdnController < ::ApplicationController
  requires_plugin KarmaScore::PLUGIN_NAME

  # api_url = "https://api.showkarma.xyz/api/discourse"
  attr_accessor :dao_name

  def initialize()
    @dao_name = SiteSetting.DAO_name
  end

  def load_cdn
    begin
      render json: { data: { allowance: "is allowed mtf" } }
    end
  end
end
