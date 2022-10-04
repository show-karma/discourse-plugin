# frozen_string_literal: true
require "net/http"

class KarmaScore::KarmaController < ::ApplicationController
  requires_plugin KarmaScore::PLUGIN_NAME

  before_action :ensure_logged_in

  # api_url = "https://api.showkarma.xyz/api"
  attr_accessor :api_url, :api_token, :delegate_thread_id

  def initialize()
    @api_url = "http://192.168.123.101:3001/api"
    @api_token = SiteSetting.Karma_API_Key
    @delegate_thread_id = SiteSetting.Delegate_pitch_thread_id
  end;

  def save_vote_reason
    body = params.require(:karma)
    begin
      discourse_handle = current_user.username
      dao_name = SiteSetting.DAO_name
      public_address = body.require(:publicAddress)
      proposal_id = body.require(:proposalId)

      uri = URI("#{api_url}/#{dao_name}/vote-reason/#{public_address}/#{proposal_id}")

      body = {
        summary: body.require(:summary),
        recommendation: body.require(:recommendation),
        threadId: body.require(:threadId),
        postId: body.require(:postId),
      }

      render json: Discourse::SiteSettings
    rescue KarmaScore::Error => e
      render_json_error e.message
    end
  end

  def save_delegate_pitch
    body = params.require(:karma)
    begin
      discourse_handle = current_user.username
      dao_name = SiteSetting.DAO_name
      public_address = body.require(:publicAddress)

      uri = URI("#{api_url}/#{dao_name}/delegate-pitch/#{public_address}")

      body = {
        description: body.require(:description),
        threadId: delegate_thread_id,
        postId: body.require(:postId),
      }
      render json: {body: body, url: api_url}
    rescue KarmaScore::Error => e
      render_json_error e.message
    end
  end
end
