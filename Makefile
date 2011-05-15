test:
	@NODE_ENV=test ./support/expresso/bin/expresso \
		-I lib \
		-I support \
		-I support/JSV/lib \
		$(TESTFLAGS) \
		test/*.test.js

test-cov:
	@TESTFLAGS=--cov $(MAKE) test

.PHONY: test test-cov
