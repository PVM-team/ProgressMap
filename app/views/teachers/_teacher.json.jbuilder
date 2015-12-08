json.id teacher.id
json.email teacher.email
json.name teacher.name

json.courses teacher.courses do |course|
    json.id course.id
    json.name course.name
end
