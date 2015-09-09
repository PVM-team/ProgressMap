json.course(@course) do |course|
  json.extract! course, :id
end

json.participants(@participants) do |participant|
  json.extract! participant, :id
end

json.assignments(@assignments) do |assignment|
  json.extract! assignment, :id
end

json.locations(@locations) do |location|
  json.extract! location, :id, :assignment_id, :x, :y
end