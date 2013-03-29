<?php

class Add_Sortable_To_Fields {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
		//
        Schema::table('fields', function($table) {
            $table->boolean('sortable');
        });
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::table('fields', function($table) {
            $table->drop_column('sortable');
        });
	}

}
