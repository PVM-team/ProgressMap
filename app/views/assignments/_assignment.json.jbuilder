json.id assignment.id
json.location assignment.location, partial: 'locations/location', as: :location
json.doers assignment.doers, partial: 'users/user', as: :user