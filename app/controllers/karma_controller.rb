# frozen_string_literal: true
require "net/http"
require "uri"

class KarmaScore::KarmaController < ::ApplicationController
  requires_plugin KarmaScore::PLUGIN_NAME

  before_action :ensure_logged_in

  # api_url = "https://api.showkarma.xyz/api"
  attr_accessor :api_url, :api_token, :delegate_thread_id, :dao_name, :headers

  def initialize()
    @dao_name = SiteSetting.DAO_name
    @api_token = SiteSetting.Karma_API_Key
    @delegate_thread_id = SiteSetting.Delegate_pitch_thread_id
    @api_url = "https://api.showkarma.xyz/api/dao"
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
    summary = params.require(:summary)
    recommendation = params.require(:recommendation)
    thread_id = params.require(:threadId)
    post_id = params.require(:postId)

    begin
      discourse_handle = current_user.username

      uri = URI.parse("#{api_url}/#{dao_name}/vote-reason/#{public_address}/#{proposal_id}")

      body = {
        threadId: thread_id,
        postId: post_id,
        recommendation: recommendation,
        summary: summary,
      }

      res = Net::HTTP::start(uri.host, uri.port) do |http|
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
        render json: { status: "error", error: response["error"]["message"] }, status: response["statusCode"]
      else
        render json: { status: "ok", res: response }
      end
    rescue KarmaScore::Error => e
      render_json_error e.message
    end
  end

  def save_delegate_pitch
    body = params.require(:karma)
    description = params.require(:description)
    post_id = params.require(:postId)
    public_address = params.require(:publicAddress)
    begin
      discourse_handle = current_user.username

      uri = URI.parse("#{api_url}/#{dao_name}/delegate-pitch/#{public_address}")

      body = {
        description: description,
        threadId: delegate_thread_id,
        postId: post_id,
        discourseHandle: discourse_handle,
        languages: body["languages"],
        interests: body["interests"],
      }

      res = Net::HTTP::start(uri.host, uri.port) do |http|
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
        render json: { status: "error", error: response["error"]["message"] }, status: response["statusCode"]
      else
        render json: { status: "ok", res: response }
      end
    rescue KarmaScore::Error => e
      render_json_error e.message
    end
  end
end
