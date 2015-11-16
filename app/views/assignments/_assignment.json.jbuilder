json.id assignment.id
json.name assignment.name
json.number assignment.number
json.location assignment.location, partial: 'locations/location', as: :location

json.attempters assignment.attempters, partial: 'students/student', as: :student
json.doers assignment.doers, partial: 'students/student', as: :student
json.dependencies assignment.dependencies, partial: 'assignments/dependency', as: :dependency