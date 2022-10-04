# frozen_string_literal: true

# this.voteUrl = `${apiUrl}/${daoName}/vote-reason/${publicAddress}`;
# this.pitchUrl = `${apiUrl}/${daoName}/delegate-pitch/${publicAddress}`;

class KarmaScore::KarmaController < ::ApplicationController
  requires_plugin KarmaScore::PLUGIN_NAME

  before_action :ensure_logged_in

  def vote
    body = params.require(:karma)
    begin
      render json: Discourse::SiteSettings
    rescue KarmaScore::Error => e
      render_json_error e.message
    end
  end

  def delegate_pitch
    body = params.require(:karma)
    begin
      render json: { s: SiteSetting.DAO_name, b: body }
    rescue KarmaScore::Error => e
      render_json_error e.message
    end
  end
end
