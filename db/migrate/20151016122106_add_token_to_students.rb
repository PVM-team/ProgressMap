class AddTokenToStudents < ActiveRecord::Migration
  def change
  	add_column :students, :token, :string
  end
end