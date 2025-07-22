require 'net/http'
require 'json'
require 'uri'

CROISSANT_BASE_URL = 'https://croissant-api.fr/api'

class Game
  attr_accessor :game_id, :name, :description, :owner_id, :download_link, :price, :show_in_store,
                :icon_hash, :splash_hash, :banner_hash, :genre, :release_date, :developer,
                :publisher, :platforms, :rating, :website, :trailer_link, :multiplayer
  def initialize(attrs = {})
    attrs.each { |k, v| send("#{k}=", v) if respond_to?("#{k}=") }
  end
end

class User
  attr_accessor :user_id, :username, :avatar, :discriminator, :public_flags, :flags, :banner,
                :accent_color, :global_name, :balance
  def initialize(attrs = {})
    attrs.each { |k, v| send("#{k}=", v) if respond_to?("#{k}=") }
  end
end

class Item
  attr_accessor :item_id, :name, :description, :price, :owner, :show_in_store, :icon_hash, :deleted
  def initialize(attrs = {})
    attrs.each { |k, v| send("#{k}=", v) if respond_to?("#{k}=") }
  end
end

class InventoryItem
  attr_accessor :name, :description, :item_id, :amount
  def initialize(attrs = {})
    attrs.each { |k, v| send("#{k}=", v) if respond_to?("#{k}=") }
  end
end

class Inventory
  attr_accessor :user_id, :inventory
  def initialize(attrs = {})
    @inventory = (attrs['inventory'] || []).map { |i| InventoryItem.new(i) }
    @user_id = attrs['user_id']
  end
end

class Lobby
  attr_accessor :lobby_id, :users
  def initialize(attrs = {})
    @lobby_id = attrs['lobby_id']
    @users = attrs['users'] || []
  end
end

class Studio
  attr_accessor :studio_id, :name, :admin_id, :users
  def initialize(attrs = {})
    @studio_id = attrs['studio_id']
    @name = attrs['name']
    @admin_id = attrs['admin_id']
    @users = (attrs['users'] || []).map { |u| User.new(u) }
  end
end

class CroissantAPI
  def initialize(token = nil)
    @token = token
  end

  def get(path, auth: false)
    uri = URI("#{CROISSANT_BASE_URL}#{path}")
    req = Net::HTTP::Get.new(uri)
    req['Authorization'] = "Bearer #{@token}" if auth && @token
    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
    JSON.parse(res.body)
  end

  def post(path, body = {}, auth: false)
    uri = URI("#{CROISSANT_BASE_URL}#{path}")
    req = Net::HTTP::Post.new(uri)
    req['Content-Type'] = 'application/json'
    req['Authorization'] = "Bearer #{@token}" if auth && @token
    req.body = body.to_json
    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
    JSON.parse(res.body)
  end

  def put(path, body = {}, auth: false)
    uri = URI("#{CROISSANT_BASE_URL}#{path}")
    req = Net::HTTP::Put.new(uri)
    req['Content-Type'] = 'application/json'
    req['Authorization'] = "Bearer #{@token}" if auth && @token
    req.body = body.to_json
    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
    JSON.parse(res.body)
  end

  def delete(path, auth: false)
    uri = URI("#{CROISSANT_BASE_URL}#{path}")
    req = Net::HTTP::Delete.new(uri)
    req['Authorization'] = "Bearer #{@token}" if auth && @token
    res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
    JSON.parse(res.body)
  end

  # --- USERS ---
  def get_me
    User.new(get('/users/@me', auth: true))
  end

  def get_user(user_id)
    User.new(get("/users/#{user_id}"))
  end

  def search_users(query)
    get("/users/search?q=#{URI.encode_www_form_component(query)}").map { |u| User.new(u) }
  end

  def verify_user(user_id, verification_key)
    get("/users/auth-verification?userId=#{user_id}&verificationKey=#{verification_key}")
  end

  def transfer_credits(target_user_id, amount)
    post('/users/transfer-credits', { targetUserId: target_user_id, amount: amount }, auth: true)
  end

  def create_user(user_hash)
    User.new(post('/users/create', user_hash, auth: true))
  end

  def get_user_by_steam_id(steam_id)
    User.new(get("/users/getUserBySteamId?steamId=#{steam_id}"))
  end

  # --- GAMES ---
  def list_games
    get('/games').map { |g| Game.new(g) }
  end

  def get_game(game_id)
    Game.new(get("/games/#{game_id}"))
  end

  def list_my_games
    get('/games/@mine', auth: true).map { |g| Game.new(g) }
  end

  def list_owned_games
    get('/games/list/@me', auth: true).map { |g| Game.new(g) }
  end

  def list_owned_games_by_user(user_id)
    get("/games/list/#{user_id}").map { |g| Game.new(g) }
  end

  def create_game(game_hash)
    Game.new(post('/games', game_hash, auth: true))
  end

  def update_game(game_id, game_hash)
    Game.new(put("/games/#{game_id}", game_hash, auth: true))
  end

  def delete_game(game_id)
    delete("/games/#{game_id}", auth: true)
  end

  # --- ITEMS ---
  def list_items
    get('/items').map { |i| Item.new(i) }
  end

  def list_my_items
    get('/items/@mine', auth: true).map { |i| Item.new(i) }
  end

  def get_item(item_id)
    Item.new(get("/items/#{item_id}"))
  end

  def create_item(item_hash)
    Item.new(post('/items/create', item_hash, auth: true))
  end

  def update_item(item_id, item_hash)
    Item.new(put("/items/#{item_id}", item_hash, auth: true))
  end

  def delete_item(item_id)
    delete("/items/#{item_id}", auth: true)
  end

  def buy_item(item_id, amount)
    post('/items/buy', { itemId: item_id, amount: amount }, auth: true)
  end

  def sell_item(item_id, amount)
    post('/items/sell', { itemId: item_id, amount: amount }, auth: true)
  end

  def give_item(item_id, amount)
    post('/items/give', { itemId: item_id, amount: amount }, auth: true)
  end

  def consume_item(item_id, amount)
    post('/items/consume', { itemId: item_id, amount: amount }, auth: true)
  end

  def drop_item(item_id, amount)
    post('/items/drop', { itemId: item_id, amount: amount }, auth: true)
  end

  def transfer_item(item_id, amount, target_user_id)
    post('/items/transfer', { itemId: item_id, amount: amount, targetUserId: target_user_id }, auth: true)
  end

  # --- INVENTORY ---
  def get_inventory(user_id)
    get("/inventory/#{user_id}").map { |i| InventoryItem.new(i) }
  end

  # --- LOBBIES ---
  def get_lobby(lobby_id)
    Lobby.new(get("/lobbies/#{lobby_id}"))
  end

  def get_user_lobby(user_id)
    Lobby.new(get("/lobbies/user/#{user_id}"))
  end

  def get_my_lobby
    Lobby.new(get('/lobbies/@me', auth: true))
  end

  def create_lobby(lobby_hash)
    Lobby.new(post('/lobbies', lobby_hash, auth: true))
  end

  def join_lobby(lobby_id)
    post('/lobbies/join', { lobbyId: lobby_id }, auth: true)
  end

  def leave_lobby(lobby_id)
    post('/lobbies/leave', { lobbyId: lobby_id }, auth: true)
  end

  # --- STUDIOS ---
  def get_studio(studio_id)
    Studio.new(get("/studios/#{studio_id}"))
  end

  # --- OAUTH2 ---
  def get_user_by_code(code, client_id, client_secret, redirect_uri)
    post('/oauth2/token', {
      code: code,
      client_id: client_id,
      client_secret: client_secret,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    })
  end
end
