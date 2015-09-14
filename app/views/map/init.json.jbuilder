json.course(@course) do |course|
  json.extract! course, :id
end

json.current_user @current_user, partial:'users/user', as: :user

json.participants @participants, partial:'users/user', as: :user
json.assignments @assignments, partial: 'assignments/assignment', as: :assignment