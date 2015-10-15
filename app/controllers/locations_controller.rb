class LocationsController < ApplicationController

	def move
		course = Course.find_by id: params[:course_id]
		move = params[:move]

		course.assignments.each do |assignment|
			location = assignment.location

			location.y = location.y + move
			location.save
		end

		@assignment = course.assignments

		render 'assignments/show.json.jbuilder'
	end

	def update
		location = Location.find params[:id]

		location.x = params[:x] if params[:x]
		location.y = params[:y] if params[:y]

		location.save
	end

	private

		def location_params
            params.require(:location).permit(:x, :y)
        end
end