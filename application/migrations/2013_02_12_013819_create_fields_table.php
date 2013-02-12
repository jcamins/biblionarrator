<?php

class Create_Fields_Table {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('fields', function($table) {
            $table->create();
            $table->increments('id');
            $table->string('schema');
            $table->string('field');
            $table->string('description')->nullable();
            $table->unique(array('schema', 'field'));
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
        Schema::drop('fields');
	}

}
