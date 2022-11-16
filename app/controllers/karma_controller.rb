# frozen_string_literal: true
require "net/http"
require "uri"

class KarmaScore::KarmaController < ::ApplicationController
  requires_plugin KarmaScore::PLUGIN_NAME

  before_action :ensure_logged_in

  # api_url = "https://api.showkarma.xyz/api/discourse"
  attr_accessor :api_url, :api_token, :delegate_thread_id, :dao_name, :headers

  def initialize()
    @dao_name = SiteSetting.DAO_name
    @api_token = SiteSetting.Karma_API_Key
    @delegate_thread_id = SiteSetting.Delegate_pitch_thread_id
    @api_url = "https://api.showkarma.xyz/api/forum-user"
    # @api_url = "http://192.168.123.101:3001/api/forum-user"
    @headers = { "Content-Type" => "application/json", "authorization" => api_token }
  end

  def is_api_allowed
    begin
      render json: { data: { allowance: !SiteSetting.Karma_API_Key.empty? } }
    end
  end

  def save_vote_reason
    public_address = params.require(:publicAddress)
    proposal_id = params.require(:proposalId)
    recommendation = params.require(:recommendation)
    thread_id = params.require(:threadId)
    post_id = params.require(:postId)

    begin
      discourse_handle = current_user.username

      uri = URI.parse("#{api_url}/#{dao_name}/vote-reason/#{public_address}/#{proposal_id}")

      body = {
        threadId: thread_id.to_i,
        postId: post_id.to_i,
        recommendation: recommendation,
        summary: "-",
      }

      res = Net::HTTP::start(uri.host, uri.port, use_ssl: uri.scheme == "https") do |http|
        if (request.request_method === "POST")
          req = Net::HTTP::Post.new(uri.request_uri, headers)
        elsif (request.request_method === "PUT")
          req = Net::HTTP::Put.new(uri.request_uri, headers)
        end
        req.body = body.to_json
        http.request(req)
      end

      response = JSON.parse(res.body)

      if (response.key?("statusCode"))
        render json: { status: "error", error: response["error"]["message"], rawError: response }, status: response["statusCode"]
      else
        render json: { status: "ok", res: response }
      end
    rescue KarmaScore::Error => e
      render_json_error e.message
    end
  end

  def save_delegate_pitch
    body = params.require(:karma)
    custom_fields = params.require(:customFields)
    post_id = params.require(:postId)
    public_address = params.require(:publicAddress)
    forum = params.require(:forum)
    begin
      discourse_handle = current_user.username

      uri = URI.parse("#{api_url}/#{dao_name}/delegate-pitch/#{public_address}")

      body = {
        customFields: body["customFields"],
        threadId: delegate_thread_id.to_i,
        postId: post_id.to_i,
        discourseHandle: discourse_handle,
        forum: forum,
      }

      res = Net::HTTP::start(uri.host, uri.port, use_ssl: uri.scheme == "https") do |http|
        if (request.request_method === "POST")
          req = Net::HTTP::Post.new(uri.request_uri, headers)
        elsif (request.request_method === "PUT")
          req = Net::HTTP::Put.new(uri.request_uri, headers)
        end
        req.body = body.to_json
        http.request(req)
      end

      response = JSON.parse(res.body)

      if (response.key?("statusCode"))
        render json: { status: "error", error: response["error"]["message"], rawError: response, req: custom_fields }, status: response["statusCode"]
      else
        render json: { status: "ok", res: response }
      end
    rescue KarmaScore::Error => e
      render_json_error e.message
    end
  end
end
