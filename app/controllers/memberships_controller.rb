class MembershipsController < ApplicationController

	def create
		membership = Membership.new(membership_params)
		membership.save

		@membership = []
		@membership << membership

		render 'memberships/show.json.jbuilder'
	end

	def destroy
		membership = Membership.find_by_course_id_and_user_id(params[:course_id], params[:user_id])
		membership.destroy if membership

		render plain: "Membership deleted"
	end

	private

		def membership_params
			params.require(:membership).permit(:course_id, :user_id)
		end
end