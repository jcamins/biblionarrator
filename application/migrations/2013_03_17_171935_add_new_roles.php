<?php

class Add_New_Roles {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
		Role::create(array('name' => 'manager'));
		Role::create(array('name' => 'cataloger'));
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
		Role::where_name('manager')->first()->delete;
		Role::where_name('cataloger')->first()->delete;
	}

}
