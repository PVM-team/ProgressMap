json.current_user(@current_user) do |user|
  json.extract! user, :id
end

json.done_assignments(@done_assignments) do |assignment|
  json.extract! assignment, :id
end

json.done_assignment_locations(@done_assignment_locations) do |location|
  json.extract! location, :id, :assignment_id, :x, :y
end