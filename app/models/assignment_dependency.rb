class AssignmentDependency < ActiveRecord::Base
  
  belongs_to :assignment
  belongs_to :dependency, :class_name => 'Assignment'
  
  validates :assignment_id, numericality: { only_integer: true }
  validates :dependency_id, numericality: { only_integer: true }
end