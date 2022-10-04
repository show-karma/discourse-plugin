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
    @api_url = "http://192.168.123.101:3001/api/dao"
    @headers = { "Content-Type" => "application/json", "X-AUTH-Token" => api_token }
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
        req = Net::HTTP::Post.new(uri.request_uri, headers)
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
    public_address = body.require(:publicAddress)

    begin
      discourse_handle = current_user.username

      uri = URI.parse("#{api_url}/#{dao_name}/delegate-pitch/#{public_address}")

      body = {
        description: description,
        threadId: delegate_thread_id,
        postId: post_id,
        discourseHandle: discourse_handle,
      }

      res = Net::HTTP::start(uri.host, uri.port) do |http|
        req = Net::HTTP::Post.new(uri.request_uri, headers)
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