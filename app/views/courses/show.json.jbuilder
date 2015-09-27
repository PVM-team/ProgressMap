json.participants @participants, partial:'users/user', as: :user
json.assignments @assignments, partial: 'assignments/assignment', as: :assignment
