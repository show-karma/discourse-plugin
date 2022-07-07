# **Karma Score** Discourse Plugin

**Plugin Summary**

__Step 1__: To install the plugin, you can follow the [Install Plugins in Discourse](https://meta.discourse.org/t/install-plugins-in-discourse/19157) official instructions.

__Step 2__: After the installation, the user should go to the plugins page (Admin -> Plugins) and hit Settings under `Karma` plugin. Then, set the Dao Name as registered at [Karma](https://showkarma.xyz).
![plugin-page](./docs/assets/plugins.png)

> After these two steps, refresh the page to ensure that the new configurations are loaded and the plugin is ready. The admin can also choose which stats to show by ticking the checkboxes in the settings page (_note that health score works only for Gitcoin Dao_).
![plugin-settings](./docs/assets/settings.png)

---

## How does it work?

The Karma Score plugin uses the forum username of users to search for metadata in our API, showing stats we gather in the user profile, such as **Karma score, Gitcoin Health score, Delegated votes, Snapshot voting stats** and **On-chain voting stats**.

These stats will be shown at:

1. Profile card
   ![profile-card](./docs/assets/img1.png)

2. Profile Summary page
   ![profile-summary](./docs/assets/img2.png)


