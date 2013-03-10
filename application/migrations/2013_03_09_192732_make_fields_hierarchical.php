<?php

class Make_Fields_Hierarchical {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('fields', function($table) {
            $table->integer('parent')->unsigned()->nullable();
            $table->foreign('parent')->references('id')->on('fields');
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
            $table->drop_column('parent');
        });
	}

}
