<?php

class Create_Record_Types_Table {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('record_types', function($table) {
            $table->create();
            $table->increments('id');
            $table->string('name');
            $table->string('description');
            $table->timestamps();
        });
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::drop('record_types');
	}

}
